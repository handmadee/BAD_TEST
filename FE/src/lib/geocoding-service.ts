export interface GeocodingResult {
    latitude: number;
    longitude: number;
    display_name: string;
    address?: any;
}

export interface ReverseGeocodingResult {
    display_name: string;
    address?: any;
}

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
    address?: any;
}

class GeocodingService {
    private readonly NOMINATIM_URL =
        "https://nominatim.openstreetmap.org/search";

    /**
     * Tìm tọa độ từ địa chỉ - gọi trực tiếp Nominatim API
     */
    async geocodeAddress(address: string): Promise<GeocodingResult> {
        try {
            // Build URL với proper encoding
            const url = new URL(this.NOMINATIM_URL);
            url.searchParams.set("format", "json");
            url.searchParams.set("q", address);
            url.searchParams.set("limit", "1");
            url.searchParams.set("countrycodes", "vn");
            url.searchParams.set("addressdetails", "1");

            console.log("Geocoding URL:", url.toString());

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "User-Agent":
                        "BadmintonCourtApp/1.0 (contact@badminton.com)",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const results: NominatimResult[] = await response.json();
            console.log("Nominatim results:", results);

            if (results && results.length > 0) {
                const result = results[0];
                return {
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    display_name: result.display_name,
                    address: result.address,
                };
            } else {
                throw new Error("Không tìm thấy tọa độ cho địa chỉ này");
            }
        } catch (error: any) {
            console.error("Geocoding error:", error);
            throw new Error(
                error.message || "Không thể tìm tọa độ cho địa chỉ này"
            );
        }
    }

    /**
     * Tìm địa chỉ từ tọa độ
     */
    async reverseGeocode(
        latitude: number,
        longitude: number
    ): Promise<ReverseGeocodingResult> {
        try {
            const url = new URL("https://nominatim.openstreetmap.org/reverse");
            url.searchParams.set("format", "json");
            url.searchParams.set("lat", latitude.toString());
            url.searchParams.set("lon", longitude.toString());
            url.searchParams.set("addressdetails", "1");

            const response = await fetch(url.toString(), {
                method: "GET",
                headers: {
                    "User-Agent":
                        "BadmintonCourtApp/1.0 (contact@badminton.com)",
                },
            });

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json();

            return {
                display_name: result.display_name,
                address: result.address,
            };
        } catch (error: any) {
            console.error("Reverse geocoding error:", error);
            throw new Error(
                error.message || "Không thể tìm địa chỉ cho tọa độ này"
            );
        }
    }

    /**
     * Debounced geocoding để tránh gọi API quá nhiều
     */
    private geocodingTimeout: NodeJS.Timeout | null = null;

    async geocodeAddressDebounced(
        address: string,
        delay: number = 1000
    ): Promise<GeocodingResult> {
        return new Promise((resolve, reject) => {
            if (this.geocodingTimeout) {
                clearTimeout(this.geocodingTimeout);
            }

            this.geocodingTimeout = setTimeout(async () => {
                try {
                    const result = await this.geocodeAddress(address);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, delay);
        });
    }
}

export const geocodingService = new GeocodingService();
export default geocodingService;
