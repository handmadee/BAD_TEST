// Geocoding service để convert địa chỉ thành tọa độ
interface GeocodingResult {
    lat: number;
    lng: number;
    address: string;
}

interface GeocodingCache {
    [address: string]: GeocodingResult;
}

// Cache để tránh gọi API nhiều lần cho cùng một địa chỉ
const geocodingCache: GeocodingCache = {};

// Nominatim OpenStreetMap Geocoding API (miễn phí)
export const geocodeAddress = async (
    address: string
): Promise<GeocodingResult | null> => {
    // Kiểm tra cache trước
    if (geocodingCache[address]) {
        console.log(`📍 Cache hit for: ${address}`);
        return geocodingCache[address];
    }

    try {
        console.log(`🔍 Geocoding: ${address}`);

        // Format địa chỉ cho API
        const encodedAddress = encodeURIComponent(address);

        // Sử dụng internal API route để tránh CORS
        const response = await fetch(
            `/api/geocoding?address=${encodedAddress}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        // Kiểm tra nếu có lỗi từ API
        if (!response.ok || data.error) {
            console.warn(
                `❌ No results for: ${address} - ${
                    data.error || "Unknown error"
                }`
            );
            return null;
        }

        // API route trả về object thay vì array
        if (data && data.lat && data.lng) {
            const result: GeocodingResult = {
                lat: data.lat,
                lng: data.lng,
                address: data.address || address,
            };

            // Lưu vào cache
            geocodingCache[address] = result;
            console.log(
                `✅ Geocoded: ${address} -> (${result.lat}, ${result.lng})`
            );

            return result;
        } else {
            console.warn(`❌ No results for: ${address}`);
            return null;
        }
    } catch (error) {
        console.error(`🚨 Geocoding error for "${address}":`, error);
        return null;
    }
};

// Geocode multiple addresses sử dụng batch API
export const geocodeMultipleAddresses = async (
    addresses: string[],
    delay: number = 1000 // Legacy parameter, không sử dụng nữa
): Promise<{ [address: string]: GeocodingResult | null }> => {
    const results: { [address: string]: GeocodingResult | null } = {};
    const addressesToGeocode: string[] = [];

    // Kiểm tra cache trước cho tất cả addresses
    for (const address of addresses) {
        if (geocodingCache[address]) {
            results[address] = geocodingCache[address];
            console.log(`📍 Cache hit for: ${address}`);
        } else {
            addressesToGeocode.push(address);
        }
    }

    // Nếu tất cả đều có trong cache, return luôn
    if (addressesToGeocode.length === 0) {
        return results;
    }

    try {
        console.log(
            `🔍 Batch geocoding ${addressesToGeocode.length} addresses...`
        );

        // Gọi batch API
        const response = await fetch("/api/geocoding/batch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ addresses: addressesToGeocode }),
        });

        if (!response.ok) {
            throw new Error(`Batch geocoding API error: ${response.status}`);
        }

        const batchResults = await response.json();

        // Xử lý kết quả và cache
        for (const address of addressesToGeocode) {
            const result = batchResults[address];

            if (result) {
                const geocodingResult: GeocodingResult = {
                    lat: result.lat,
                    lng: result.lng,
                    address: result.address,
                };

                // Lưu vào cache
                geocodingCache[address] = geocodingResult;
                results[address] = geocodingResult;

                console.log(
                    `✅ Batch geocoded: ${address} -> (${result.lat}, ${result.lng})`
                );
            } else {
                results[address] = null;
                console.warn(`❌ Batch geocoding failed for: ${address}`);
            }
        }
    } catch (error) {
        console.error("🚨 Batch geocoding error:", error);

        // Fallback to individual geocoding nếu batch fail
        for (const address of addressesToGeocode) {
            results[address] = await geocodeAddress(address);
        }
    }

    return results;
};

// Fallback coordinates cho Đà Nẵng nếu geocoding thất bại
export const getDaNangFallbackCoords = (index: number = 0): GeocodingResult => {
    const baseCoords = {
        lat: 16.0471,
        lng: 108.2068,
    };

    return {
        lat: baseCoords.lat + index * 0.005,
        lng: baseCoords.lng + index * 0.005,
        address: "Đà Nẵng, Việt Nam (fallback)",
    };
};

// Debug function để kiểm tra geocoding
export const debugGeocoding = async (address: string) => {
    console.log(`🔍 Debug geocoding for: "${address}"`);

    const startTime = Date.now();
    const result = await geocodeAddress(address);
    const endTime = Date.now();

    console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
    console.log(`📍 Result:`, result);

    return result;
};

// Pre-populate cache với một số địa chỉ phổ biến ở Đà Nẵng
export const preloadDaNangAddresses = () => {
    // Một số địa chỉ phổ biến có thể được cache trước
    const commonAddresses = {
        "123 Nguyễn Văn Thoại, Đà Nẵng": {
            lat: 16.0544,
            lng: 108.2024,
            address: "123 Nguyễn Văn Thoại, Đà Nẵng",
        },
        "456 Hải Châu, Đà Nẵng": {
            lat: 16.0678,
            lng: 108.212,
            address: "456 Hải Châu, Đà Nẵng",
        },
    };

    Object.assign(geocodingCache, commonAddresses);
    console.log(
        `📦 Preloaded ${Object.keys(commonAddresses).length} addresses to cache`
    );
};
