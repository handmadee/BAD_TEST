"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Image from "next/image";
import Link from "next/link";
import { authService, courtService } from "@/lib";
import type { User, Court } from "@/types/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CourtDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const [selectedImage, setSelectedImage] = useState(0);

    // State cho API data
    const [user, setUser] = useState<User | null>(null);
    const [courtDetails, setCourtDetails] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load data khi component mount
    useEffect(() => {
        loadData();
    }, [params.id]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [userResponse, courtResponse] = await Promise.all([
                authService.getCurrentUser(),
                courtService.getCourtById(parseInt(params.id)),
            ]);

            setUser(userResponse.data);
            setCourtDetails(courtResponse.data);
        } catch (error: any) {
            console.error("Error loading court details:", error);
            setError(
                error?.response?.data?.message || "Không thể tải thông tin sân"
            );
        } finally {
            setLoading(false);
        }
    };

    const getAmenitiesList = () => {
        if (!courtDetails?.amenities) return [];
        if (typeof courtDetails.amenities === "string") {
            return courtDetails.amenities
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a.length > 0);
        }
        return [];
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return {
                    text: "Hoạt động",
                    color: "bg-green-100 text-green-800",
                };
            case "INACTIVE":
                return { text: "Tạm nghỉ", color: "bg-gray-100 text-gray-800" };
            case "MAINTENANCE":
                return {
                    text: "Bảo trì",
                    color: "bg-yellow-100 text-yellow-800",
                };
            default:
                return {
                    text: "Không xác định",
                    color: "bg-gray-100 text-gray-800",
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#c0162d] mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        Đang tải thông tin sân...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !courtDetails) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Không thể tải thông tin sân
                    </h1>
                    <p className="text-gray-600 mb-4">
                        {error || "Sân không tồn tại hoặc đã bị xóa"}
                    </p>
                    <Link
                        href="/dashboard"
                        className="bg-[#c0162d] text-white px-6 py-3 rounded-lg hover:bg-[#a01325] transition-colors"
                    >
                        Quay lại danh sách sân
                    </Link>
                </div>
            </div>
        );
    }

    const amenitiesList = getAmenitiesList();
    const statusDisplay = getStatusDisplay(courtDetails.status);
    const images = courtDetails.images || ["/courts/court-placeholder.jpg"];

    return (
        <ProtectedRoute requiredRole="COURT_OWNER">
            <div className="min-h-screen bg-gray-50">
                <Header />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Back button */}
                    <div className="mb-6">
                        <Link
                            href="/dashboard"
                            className="flex items-center text-gray-600 hover:text-[#c0162d] transition-colors"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            <span>Quay lại danh sách sân</span>
                        </Link>
                    </div>

                    {/* Court Details */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                        {/* Image Gallery */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                            <div className="md:col-span-2">
                                <div className="relative h-96 rounded-xl overflow-hidden">
                                    <Image
                                        src={images[selectedImage]}
                                        alt={courtDetails.name}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            const target =
                                                e.target as HTMLImageElement;
                                            target.src =
                                                "/courts/court-placeholder.jpg";
                                        }}
                                    />
                                </div>
                                {images.length > 1 && (
                                    <div className="flex mt-4 space-x-2 overflow-x-auto">
                                        {images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={`relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 ${
                                                    selectedImage === index
                                                        ? "ring-2 ring-[#c0162d]"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setSelectedImage(index)
                                                }
                                            >
                                                <Image
                                                    src={image}
                                                    alt={`${
                                                        courtDetails.name
                                                    } ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    onError={(e) => {
                                                        const target =
                                                            e.target as HTMLImageElement;
                                                        target.src =
                                                            "/courts/court-placeholder.jpg";
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h1 className="text-2xl font-bold">
                                        {courtDetails.name}
                                    </h1>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}
                                    >
                                        {statusDisplay.text}
                                    </span>
                                </div>

                                {/* Rating */}
                                {courtDetails.averageRating &&
                                courtDetails.totalReviews ? (
                                    <div className="flex items-center mb-4">
                                        <svg
                                            className="w-5 h-5 text-yellow-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-sm font-medium ml-1">
                                            {courtDetails.averageRating.toFixed(
                                                1
                                            )}
                                        </span>
                                        <span className="text-gray-500 text-sm ml-1">
                                            ({courtDetails.totalReviews} đánh
                                            giá)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center mb-4">
                                        <svg
                                            className="w-5 h-5 text-gray-400"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-gray-500 text-sm ml-1">
                                            Chưa có đánh giá
                                        </span>
                                    </div>
                                )}

                                {/* Address */}
                                <p className="flex items-center text-gray-600 mb-2">
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    {courtDetails.address}
                                </p>

                                {/* Operating Hours */}
                                {courtDetails.operatingHours && (
                                    <p className="flex items-center text-gray-600 mb-2">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        {courtDetails.operatingHours}
                                    </p>
                                )}

                                {/* Phone */}
                                {courtDetails.phone && (
                                    <p className="flex items-center text-gray-600 mb-2">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                        <a
                                            href={`tel:${courtDetails.phone}`}
                                            className="text-[#c0162d] hover:underline"
                                        >
                                            {courtDetails.phone}
                                        </a>
                                    </p>
                                )}

                                {/* Email */}
                                {courtDetails.email && (
                                    <p className="flex items-center text-gray-600 mb-4">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <a
                                            href={`mailto:${courtDetails.email}`}
                                            className="text-[#c0162d] hover:underline"
                                        >
                                            {courtDetails.email}
                                        </a>
                                    </p>
                                )}

                                {/* Sport Type */}
                                {courtDetails.sportTypes && (
                                    <p className="flex items-center text-gray-600 mb-4">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                            />
                                        </svg>
                                        <span className="font-medium text-[#c0162d]">
                                            {courtDetails.sportTypes}
                                        </span>
                                    </p>
                                )}

                                {/* Contact for Pricing */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        💰 Báo giá
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Liên hệ trực tiếp để biết giá và đặt sân
                                    </p>
                                </div>

                                {/* Amenities */}
                                {amenitiesList.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-medium mb-3">
                                            🏆 Tiện ích:
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {amenitiesList.map(
                                                (amenity, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center"
                                                    >
                                                        <svg
                                                            className="w-4 h-4 text-green-500 mr-2"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        <span className="text-sm">
                                                            {amenity}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {courtDetails.phone && (
                                        <a
                                            href={`tel:${courtDetails.phone}`}
                                            className="w-full bg-[#c0162d] text-white py-3 rounded-lg font-medium hover:bg-[#a01325] transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                            Gọi điện đặt sân
                                        </a>
                                    )}

                                    <Link
                                        href={`/dashboard/courts/${courtDetails.id}/edit`}
                                        className="w-full border-2 border-[#c0162d] text-[#c0162d] py-3 rounded-lg font-medium hover:bg-[#c0162d] hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                            />
                                        </svg>
                                        Chỉnh sửa thông tin sân
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Court Description */}
                        {courtDetails.description && (
                            <div className="p-6 border-t border-gray-200">
                                <h2 className="text-xl font-bold mb-4">
                                    📝 Mô tả chi tiết
                                </h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {courtDetails.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Management Actions */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-6">
                                ⚙️ Quản lý sân
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    href={`/dashboard/courts/${courtDetails.id}/bookings`}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <svg
                                                className="w-6 h-6 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">
                                                Lịch đặt sân
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Xem và quản lý booking
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    href={`/dashboard/courts/${courtDetails.id}/pricing`}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <svg
                                                className="w-6 h-6 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">
                                                Quản lý giá
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Cập nhật bảng giá
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    href={`/dashboard/courts/${courtDetails.id}/reviews`}
                                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <svg
                                                className="w-6 h-6 text-yellow-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">
                                                Đánh giá
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Xem phản hồi khách hàng
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
