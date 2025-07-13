import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { addresses } = await request.json();

        if (!addresses || !Array.isArray(addresses)) {
            return NextResponse.json(
                { error: "Addresses array is required" },
                { status: 400 }
            );
        }

        const results: {
            [address: string]: {
                lat: number;
                lng: number;
                address: string;
            } | null;
        } = {};

        // Process addresses with delay to respect rate limits
        for (let i = 0; i < addresses.length; i++) {
            const address = addresses[i];

            try {
                const encodedAddress = encodeURIComponent(address);

                // Proxy request to Nominatim API
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=vn`,
                    {
                        headers: {
                            "User-Agent": "Badminton-Court-App/1.0",
                        },
                    }
                );

                if (response.ok) {
                    const data = await response.json();

                    if (data && data.length > 0) {
                        results[address] = {
                            lat: parseFloat(data[0].lat),
                            lng: parseFloat(data[0].lon),
                            address: data[0].display_name || address,
                        };
                    } else {
                        results[address] = null;
                    }
                } else {
                    results[address] = null;
                }
            } catch (error) {
                console.error(`Error geocoding ${address}:`, error);
                results[address] = null;
            }

            // Add delay between requests (except for the last one)
            if (i < addresses.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Batch geocoding error:", error);
        return NextResponse.json(
            { error: "Batch geocoding failed" },
            { status: 500 }
        );
    }
}
