import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Court } from "@/types/api";

interface CourtCardProps {
    court: Court;
    onCardClick?: (court: Court) => void;
}

export function CourtCard({ court, onCardClick }: CourtCardProps) {
    const handleCardClick = (e: React.MouseEvent) => {
        // Nếu có callback, gọi callback thay vì navigate
        if (onCardClick) {
            e.preventDefault();
            onCardClick(court);
        }
        // Nếu không có callback, sẽ navigate như bình thường qua Link
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return { text: "Hoạt động", color: "bg-green-500" };
            case "INACTIVE":
                return { text: "Tạm nghỉ", color: "bg-gray-500" };
            case "MAINTENANCE":
                return { text: "Bảo trì", color: "bg-yellow-500" };
            default:
                return { text: "Không xác định", color: "bg-gray-500" };
        }
    };

    const getSportTypeColor = (sportType: string) => {
        switch (sportType) {
            case "Cầu lông":
                return "bg-red-100 text-red-800";
            case "Pickleball":
                return "bg-green-100 text-green-800";
            case "Cả hai":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getAmenitiesList = () => {
        if (!court.amenities) return [];
        if (typeof court.amenities === "string") {
            return court.amenities
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a.length > 0);
        }
        return [];
    };

    const statusDisplay = getStatusDisplay(court.status);
    const amenitiesList = getAmenitiesList();

    return (
        <Link href={`/courts/${court.id}`}>
            <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={handleCardClick}
            >
                {/* Image */}
                <div className="relative h-48 w-full">
                    <Image
                        src={
                            court.images?.[0] || "/courts/court-placeholder.jpg"
                        }
                        alt={court.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/courts/court-placeholder.jpg";
                        }}
                    />
                    <div className="absolute top-3 right-3">
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSportTypeColor(
                                court.sportTypes || ""
                            )}`}
                        >
                            {court.sportTypes}
                        </span>
                    </div>
                    <div className="absolute top-3 left-3">
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusDisplay.color}`}
                        >
                            {statusDisplay.text}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                        {court.name}
                    </h3>

                    <p className="text-base text-gray-600 mb-2 line-clamp-1">
                        📍 {court.address}
                    </p>

                    {/* Phone & Operating Hours */}
                    <div className="flex items-center justify-between mb-3">
                        {court.phone && (
                            <div className="flex items-center gap-1">
                                <span className="text-blue-500">📞</span>
                                <a
                                    href={`tel:${court.phone}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {court.phone}
                                </a>
                            </div>
                        )}
                        {court.operatingHours && (
                            <div className="flex items-center gap-1">
                                <span className="text-green-500">🕒</span>
                                <span className="text-sm font-medium text-gray-600">
                                    {court.operatingHours}
                                </span>
                            </div>
                        )}
                    </div>

                    {court.description && (
                        <p className="text-base text-gray-600 mb-3 line-clamp-2">
                            {court.description}
                        </p>
                    )}

                    {/* Rating */}
                    {court.averageRating && court.totalReviews ? (
                        <div className="flex items-center gap-1 mb-3">
                            <span className="text-yellow-400 text-lg">⭐</span>
                            <span className="text-base font-semibold text-gray-900">
                                {court.averageRating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                                ({court.totalReviews} đánh giá)
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 mb-3">
                            <span className="text-gray-400 text-lg">⭐</span>
                            <span className="text-sm text-gray-500">
                                Chưa có đánh giá
                            </span>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-red-600">
                            Liên hệ để biết giá
                        </div>
                        {court.email && (
                            <a
                                href={`mailto:${court.email}`}
                                className="text-sm text-blue-600 hover:text-blue-800"
                                onClick={(e) => e.stopPropagation()}
                            >
                                📧 Email
                            </a>
                        )}
                    </div>

                    {/* Amenities */}
                    {amenitiesList.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {amenitiesList
                                    .slice(0, 3)
                                    .map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-sm text-gray-600 rounded-md"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                {amenitiesList.length > 3 && (
                                    <span className="px-3 py-1 bg-gray-100 text-sm text-gray-600 rounded-md">
                                        +{amenitiesList.length - 3} tiện ích
                                        khác
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
