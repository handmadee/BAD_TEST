import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json(
            { error: "Address parameter is required" },
            { status: 400 }
        );
    }

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

        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const result = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                address: data[0].display_name || address,
            };
            return NextResponse.json(result);
        } else {
            return NextResponse.json(
                { error: "No results found" },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error("Geocoding error:", error);
        return NextResponse.json(
            { error: "Geocoding failed" },
            { status: 500 }
        );
    }
}
