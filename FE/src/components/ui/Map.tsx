"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Court } from "@/types/api";
import {
    geocodeMultipleAddresses,
    getDaNangFallbackCoords,
    preloadDaNangAddresses,
} from "@/lib/geocoding";
import { Star, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// CSS cho marker icons - tối ưu performance
const markerStyles = `
.custom-marker-icon {
    border: 3px solid white !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    background: white !important;
    padding: 2px !important;
}

.custom-marker-icon:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4) !important;
    border-color: #fbbf24 !important;
}

.selected-marker {
    border-color: #ef4444 !important;
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5) !important;
}

.user-location-marker {
    background: none !important;
    border: none !important;
}

.user-location-icon {
    position: relative;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-location-dot {
    width: 12px;
    height: 12px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    position: relative;
    z-index: 2;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.user-location-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 2px solid #3b82f6;
    border-radius: 50%;
    opacity: 0.6;
    animation: pulse-user-location 2s infinite;
}

@keyframes pulse-user-location {
    0% { 
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.6;
    }
    50% { 
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0.3;
    }
    100% { 
        transform: translate(-50%, -50%) scale(2);
        opacity: 0;
    }
}
`;

// Fix for default markers - đặt đúng đường dẫn
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Tạo user location icon đơn giản với HTML
const userLocationIcon = L.divIcon({
    html: `<div class="user-location-icon">
        <div class="user-location-dot"></div>
        <div class="user-location-pulse"></div>
    </div>`,
    className: "user-location-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

// Tạo các icon cố định để tránh re-render lag
const badmintonIcon = new L.Icon({
    iconUrl: "/icons/badminton-marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "custom-marker-icon",
});

const pickleballIcon = new L.Icon({
    iconUrl: "/icons/pickleball-marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "custom-marker-icon",
});

const mixedSportIcon = new L.Icon({
    iconUrl: "/icons/mixed-sport-marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "custom-marker-icon",
});

// Selected versions với class khác
const badmintonIconSelected = new L.Icon({
    iconUrl: "/icons/badminton-marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "custom-marker-icon selected-marker",
});

const pickleballIconSelected = new L.Icon({
    iconUrl: "/icons/pickleball-marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "custom-marker-icon selected-marker",
});

const mixedSportIconSelected = new L.Icon({
    iconUrl: "/icons/mixed-sport-marker.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "custom-marker-icon selected-marker",
});

// Court interface imported from api

interface MapProps {
    courts: Court[];
    onCourtSelect?: (court: Court) => void;
    selectedCourt?: Court | null;
    userLocation?: { lat: number; lng: number } | null;
    zoomToCourt?: { lat: number; lng: number } | null;
}

// Component helper để zoom map
const MapZoomController: React.FC<{
    zoomToCourt: { lat: number; lng: number } | null;
}> = ({ zoomToCourt }) => {
    const map = useMap();

    useEffect(() => {
        if (zoomToCourt) {
            map.setView([zoomToCourt.lat, zoomToCourt.lng], 16, {
                animate: true,
                duration: 1,
            });
        }
    }, [zoomToCourt, map]);

    return null;
};

// Component để quản lý markers và auto-open popup
const MarkersWithPopup: React.FC<{
    courtsWithCoords: (Court & {
        lat?: number;
        lng?: number;
        distanceNum?: number;
    })[];
    selectedCourt: Court | null;
    onCourtSelect?: (court: Court) => void;
    getCourtIcon: (sportType: string, isSelected: boolean) => any;
}> = ({ courtsWithCoords, selectedCourt, onCourtSelect, getCourtIcon }) => {
    const markerRefs = useRef<{ [key: string]: any }>({});

    // Auto-open popup khi selectedCourt thay đổi
    useEffect(() => {
        if (selectedCourt) {
            const marker = markerRefs.current[selectedCourt.id];
            if (marker) {
                // Delay một chút để đảm bảo zoom hoàn tất
                setTimeout(() => {
                    marker.openPopup();
                }, 800);
            }
        }
    }, [selectedCourt]);

    return (
        <>
            {courtsWithCoords.map((court) => {
                const isSelected = selectedCourt?.id === court.id;
                return (
                    <Marker
                        key={court.id}
                        position={[court.lat!, court.lng!]}
                        icon={getCourtIcon(
                            court.sportTypes || "Cầu lông",
                            isSelected
                        )}
                        eventHandlers={{
                            click: () => onCourtSelect?.(court),
                        }}
                        ref={(ref) => {
                            if (ref) {
                                markerRefs.current[court.id] = ref;
                            }
                        }}
                    >
                        <Popup
                            autoPan={true}
                            closeOnClick={false}
                            closeOnEscapeKey={true}
                        >
                            <div className="min-w-48">
                                <h3
                                    className="font-bold text-base mb-2 text-blue-600 hover:text-blue-800 cursor-pointer underline hover:underline-offset-2 transition-all"
                                    onClick={() => {
                                        window.location.href = `/courts/${court.id}`;
                                    }}
                                    title="Click để xem chi tiết sân"
                                >
                                    {court.name} →
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    {court.address}
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        {(court.averageRating || 0).toFixed(1)}
                                    </span>
                                    <span className="text-red-600 font-semibold">
                                        {court.price
                                            ? `${court.price.toLocaleString()}đ/h`
                                            : "Liên hệ"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    {court.distance
                                        ? `Cách ${court.distance}km`
                                        : court.address}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
};

const Map: React.FC<MapProps> = ({
    courts,
    onCourtSelect,
    selectedCourt,
    userLocation,
    zoomToCourt,
}) => {
    const [mapCenter, setMapCenter] = useState<[number, number]>([
        16.0471, 108.2068,
    ]); // Đà Nẵng default

    const [courtsWithCoords, setCourtsWithCoords] = useState<
        (Court & { lat?: number; lng?: number; distanceNum?: number })[]
    >([]);
    const [geocodingLoading, setGeocodingLoading] = useState(false);

    // Hàm chọn icon từ các icon có sẵn (tránh tạo mới)
    const getCourtIcon = (sportType: string, isSelected: boolean = false) => {
        if (isSelected) {
            switch (sportType) {
                case "Cầu lông":
                    return badmintonIconSelected;
                case "Pickleball":
                    return pickleballIconSelected;
                case "Cả hai":
                    return mixedSportIconSelected;
                default:
                    return badmintonIconSelected;
            }
        } else {
            switch (sportType) {
                case "Cầu lông":
                    return badmintonIcon;
                case "Pickleball":
                    return pickleballIcon;
                case "Cả hai":
                    return mixedSportIcon;
                default:
                    return badmintonIcon;
            }
        }
    };

    // Geocode addresses when courts change
    useEffect(() => {
        const geocodeCourts = async () => {
            if (courts.length === 0) return;

            setGeocodingLoading(true);
            console.log("🗺️  Starting geocoding for courts...");

            // Preload common addresses
            preloadDaNangAddresses();

            // Extract unique addresses
            const addresses = courts.map((court) => court.address);

            try {
                // Geocode all addresses
                const geocodedResults = await geocodeMultipleAddresses(
                    addresses,
                    800
                ); // 800ms delay

                // Map courts with coordinates
                const courtsWithGeoCoords = courts.map((court, index) => {
                    const geocodedResult = geocodedResults[court.address];

                    if (geocodedResult) {
                        return {
                            ...court,
                            lat: geocodedResult.lat,
                            lng: geocodedResult.lng,
                            distanceNum: index + 1,
                        };
                    } else {
                        // Fallback to distributed coordinates
                        console.warn(
                            `⚠️  Using fallback coordinates for: ${court.address}`
                        );
                        const fallback = getDaNangFallbackCoords(index);
                        return {
                            ...court,
                            lat: fallback.lat,
                            lng: fallback.lng,
                            distanceNum: index + 1,
                        };
                    }
                });

                setCourtsWithCoords(courtsWithGeoCoords);
                console.log("✅ Geocoding completed!");
            } catch (error) {
                console.error("🚨 Geocoding failed:", error);
                // Fallback to distributed coordinates
                const fallbackCourts = courts.map((court, index) => {
                    const fallback = getDaNangFallbackCoords(index);
                    return {
                        ...court,
                        lat: fallback.lat,
                        lng: fallback.lng,
                        distanceNum: index + 1,
                    };
                });
                setCourtsWithCoords(fallbackCourts);
            } finally {
                setGeocodingLoading(false);
            }
        };

        geocodeCourts();
    }, [courts]);

    useEffect(() => {
        // Nếu có vị trí user, center map ở đó
        if (userLocation) {
            setMapCenter([userLocation.lat, userLocation.lng]);
        }
    }, [userLocation]);

    return (
        <div className="relative h-full w-full">
            {/* Inject CSS styles cho markers */}
            <style dangerouslySetInnerHTML={{ __html: markerStyles }} />

            {geocodingLoading && (
                <div className="absolute top-2 left-2 z-[1000] bg-white px-3 py-2 rounded-lg shadow-md border">
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#c0162d]"></div>
                        <span>Đang tìm vị trí sân...</span>
                    </div>
                </div>
            )}

            <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                className="rounded-xl"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Zoom controller */}
                <MapZoomController zoomToCourt={zoomToCourt || null} />

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={userLocationIcon}
                    >
                        <Popup>
                            <div className="text-center py-1">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <strong className="text-blue-600 text-sm">
                                        Vị trí của bạn
                                    </strong>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Vị trí hiện tại được xác định
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Court markers với auto-popup */}
                <MarkersWithPopup
                    courtsWithCoords={courtsWithCoords}
                    selectedCourt={selectedCourt || null}
                    onCourtSelect={onCourtSelect}
                    getCourtIcon={getCourtIcon}
                />
            </MapContainer>
        </div>
    );
};

export default Map;
