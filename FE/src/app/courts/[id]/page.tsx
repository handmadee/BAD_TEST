"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Court, CourtPricing } from "@/types/api";
import { courtService } from "@/lib";

export default function CourtDetailsPage() {
    const params = useParams();
    const courtId = parseInt(params.id as string);
    const [court, setCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<"weekday" | "weekend">(
        "weekday"
    );

    useEffect(() => {
        loadCourtDetails();
    }, [courtId]);

    const loadCourtDetails = async () => {
        try {
            setLoading(true);
            const response = await courtService.getCourtById(courtId);
            if (response.success) {
                setCourt(response.data);
            }
        } catch (error) {
            console.error("Error loading court details:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push("★");
        }
        if (hasHalfStar) {
            stars.push("☆");
        }
        while (stars.length < 5) {
            stars.push("☆");
        }

        return (
            <div className="flex items-center space-x-1">
                <span className="text-amber-400 text-lg">{stars.join("")}</span>
                <span className="text-gray-600 ml-2">
                    ({rating.toFixed(1)})
                </span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin sân...</p>
                </div>
            </div>
        );
    }

    if (!court) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Không tìm thấy sân
                    </h1>
                    <p className="text-gray-600">
                        Sân bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => window.history.back()}
                                className="text-slate-600 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-xl"
                            >
                                ← Quay lại
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    {court.name}
                                </h1>
                                <p className="text-sm text-slate-600">
                                    📍 {court.address}
                                </p>
                            </div>
                        </div>
                        {court.averageRating && (
                            <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-xl">
                                <span className="text-amber-500">⭐</span>
                                <span className="font-semibold text-slate-800">
                                    {court.averageRating.toFixed(1)}
                                </span>
                                <span className="text-slate-500 text-sm">
                                    ({court.totalReviews})
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Images - Compact & Beautiful */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/50">
                            <div className="aspect-[4/1.5] bg-gradient-to-r from-slate-100 to-slate-200 relative">
                                {court.images && court.images.length > 0 ? (
                                    <img
                                        src={court.images[0]}
                                        alt={court.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <span className="text-lg">
                                            📷 Chưa có hình ảnh
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            {court.images && court.images.length > 1 && (
                                <div className="p-4 grid grid-cols-6 gap-2">
                                    {court.images
                                        .slice(1, 7)
                                        .map((image, index) => (
                                            <div
                                                key={index}
                                                className="aspect-square rounded-lg overflow-hidden"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${court.name} ${
                                                        index + 2
                                                    }`}
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                                />
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Description */}
                            <div className="md:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-blue-600">
                                            📝
                                        </span>
                                    </div>
                                    Mô tả sân
                                </h2>
                                <p className="text-slate-700 leading-relaxed">
                                    {court.description ||
                                        "Chưa có mô tả chi tiết"}
                                </p>
                            </div>

                            {/* Quick Info */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-green-600">
                                            ℹ️
                                        </span>
                                    </div>
                                    Thông tin
                                </h2>
                                <div className="space-y-3">
                                    {court.operatingHours && (
                                        <div className="flex items-center p-2 bg-slate-50 rounded-lg">
                                            <span className="text-green-600 w-6">
                                                🕐
                                            </span>
                                            <span className="text-slate-700 text-sm ml-2">
                                                {court.operatingHours}
                                            </span>
                                        </div>
                                    )}
                                    {court.sportTypes && (
                                        <div className="flex flex-wrap gap-1">
                                            {court.sportTypes
                                                .split(",")
                                                .map((sport, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium"
                                                    >
                                                        {sport.trim()}
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        {court.amenities && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-purple-600">
                                            ✨
                                        </span>
                                    </div>
                                    Tiện ích
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {court.amenities
                                        .split(",")
                                        .map((amenity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border"
                                            >
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                                <span className="text-slate-700 text-sm font-medium">
                                                    {amenity.trim()}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing */}
                        {court.pricing && court.pricing.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/50">
                                {/* Modern Tabs */}
                                <div className="p-6 pb-0">
                                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                            <span className="text-emerald-600">
                                                💰
                                            </span>
                                        </div>
                                        Bảng giá
                                    </h2>
                                    <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                                        <button
                                            onClick={() =>
                                                setSelectedDay("weekday")
                                            }
                                            className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                                                selectedDay === "weekday"
                                                    ? "bg-white text-slate-900 shadow-md"
                                                    : "text-slate-600 hover:text-slate-800"
                                            }`}
                                        >
                                            📅 Thứ 2-6
                                        </button>
                                        <button
                                            onClick={() =>
                                                setSelectedDay("weekend")
                                            }
                                            className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                                                selectedDay === "weekend"
                                                    ? "bg-white text-slate-900 shadow-md"
                                                    : "text-slate-600 hover:text-slate-800"
                                            }`}
                                        >
                                            🎉 T7-CN
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 pb-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {court.pricing.map((pricing, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
                                            >
                                                <div className="text-xs font-medium text-slate-600 mb-2">
                                                    {pricing.timeSlot}
                                                </div>
                                                <div className="text-lg font-bold text-slate-900">
                                                    {formatPrice(
                                                        selectedDay ===
                                                            "weekday"
                                                            ? pricing.weekdayPrice
                                                            : pricing.weekendPrice
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <p className="text-sm text-blue-800">
                                            💡{" "}
                                            <span className="font-medium">
                                                Lưu ý:
                                            </span>{" "}
                                            Giá trên đã bao gồm các dịch vụ cơ
                                            bản. Liên hệ trực tiếp để đặt sân và
                                            xác nhận.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 sticky top-6">
                            {/* Contact Actions */}
                            <div className="space-y-3 mb-6">
                                {court.phone && (
                                    <a
                                        href={`tel:${court.phone}`}
                                        className="block w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        📞 {court.phone}
                                    </a>
                                )}
                                {court.email && (
                                    <a
                                        href={`mailto:${court.email}`}
                                        className="block w-full border-2 border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl hover:bg-slate-50 transition-all duration-200 text-center"
                                    >
                                        ✉️ Gửi email
                                    </a>
                                )}
                            </div>

                            <div className="border-t border-slate-200 pt-6">
                                <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                                    🏸 ĐẶT SÂN NGAY
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-3">
                                    Liên hệ để đặt sân và nhận tư vấn
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
