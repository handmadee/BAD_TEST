"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Image from "next/image";
import Link from "next/link";
import { authService, courtService, bookingService } from "@/lib";
import type { User, Court, CreateBookingRequest } from "@/types/api";
import { useAuth } from "@/context/AuthContext";

export default function CourtDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState<"info" | "contact" | "booking">(
        "info"
    );
    const [courtId, setCourtId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    // Auth context
    const { user: authUser, isAuthenticated } = useAuth();

    // State cho API data
    const [courtDetails, setCourtDetails] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingMessage, setBookingMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    // Resolve params first
    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setCourtId(resolvedParams.id);
        };
        resolveParams();
    }, [params]);

    // Load data khi có courtId
    useEffect(() => {
        if (courtId) {
            loadData();
        }
    }, [courtId]);

    const loadData = async () => {
        if (!courtId) return;

        setLoading(true);
        setError(null);
        try {
            const courtResponse = await courtService.getCourtById(
                parseInt(courtId)
            );
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

    const handleBooking = async () => {
        if (
            !courtDetails ||
            !isAuthenticated ||
            !selectedDate ||
            !selectedTime
        ) {
            setBookingMessage({
                type: "error",
                text: "Vui lòng chọn ngày và giờ đặt sân",
            });
            return;
        }

        setBookingLoading(true);
        setBookingMessage(null);

        try {
            const [startTime, endTime] = selectedTime.split(" - ");

            const bookingData: CreateBookingRequest = {
                courtId: courtDetails.id,
                bookingDate: selectedDate,
                startTime: startTime,
                endTime: endTime,
                notes: notes || undefined,
            };

            await bookingService.createBooking(bookingData);

            setBookingMessage({
                type: "success",
                text: "Đặt sân thành công! Vui lòng chờ xác nhận từ chủ sân.",
            });

            // Reset form
            setSelectedDate("");
            setSelectedTime("");
            setNotes("");
        } catch (error: any) {
            console.error("Error creating booking:", error);
            setBookingMessage({
                type: "error",
                text:
                    error?.response?.data?.message ||
                    "Có lỗi xảy ra khi đặt sân",
            });
        } finally {
            setBookingLoading(false);
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
                    text: "Đang hoạt động",
                    color: "bg-green-100 text-green-800",
                };
            case "INACTIVE":
                return { text: "Tạm nghỉ", color: "bg-gray-100 text-gray-800" };
            case "MAINTENANCE":
                return {
                    text: "Đang bảo trì",
                    color: "bg-yellow-100 text-yellow-800",
                };
            default:
                return {
                    text: "Không xác định",
                    color: "bg-gray-100 text-gray-800",
                };
        }
    };

    // Generate time slots (6:00 - 22:00)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 6; hour < 22; hour++) {
            const startTime = `${hour.toString().padStart(2, "0")}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
            slots.push(`${startTime} - ${endTime}`);
        }
        return slots;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
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
                        href="/courts"
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
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
    const timeSlots = generateTimeSlots();

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Back button */}
                <div className="mb-6 lg:mb-8">
                    <Link
                        href="/courts"
                        className="flex items-center text-gray-600 hover:text-red-600 text-base lg:text-lg font-medium transition-colors"
                    >
                        <svg
                            className="w-5 h-5 lg:w-6 lg:h-6 mr-2"
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

                {/* Court Header */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 lg:mb-8">
                    <div className="p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8 mb-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
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
                                            className="w-6 h-6 text-yellow-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-xl font-bold ml-2 text-gray-900">
                                            {courtDetails.averageRating.toFixed(
                                                1
                                            )}
                                        </span>
                                        <span className="text-base text-gray-600 ml-2">
                                            ({courtDetails.totalReviews} đánh
                                            giá)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-gray-400"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-base text-gray-600 ml-2">
                                            Chưa có đánh giá
                                        </span>
                                    </div>
                                )}

                                {/* Basic Info */}
                                <div className="space-y-3">
                                    <p className="flex items-center text-gray-700 text-base lg:text-lg">
                                        <svg
                                            className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
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
                                    {courtDetails.operatingHours && (
                                        <p className="flex items-center text-gray-700 text-base lg:text-lg">
                                            <svg
                                                className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
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
                                    {courtDetails.sportTypes && (
                                        <p className="flex items-center text-gray-700 text-base lg:text-lg">
                                            <svg
                                                className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
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
                                            <span className="font-medium text-red-600">
                                                {courtDetails.sportTypes}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Contact & Booking */}
                            <div className="lg:text-right space-y-4">
                                <div className="text-2xl lg:text-3xl font-bold text-red-600">
                                    Liên hệ để biết giá
                                </div>

                                <div className="space-y-2">
                                    {courtDetails.phone && (
                                        <a
                                            href={`tel:${courtDetails.phone}`}
                                            className="block bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors text-center"
                                        >
                                            📞 {courtDetails.phone}
                                        </a>
                                    )}

                                    {isAuthenticated &&
                                        courtDetails.status === "ACTIVE" && (
                                            <button
                                                onClick={() =>
                                                    setActiveTab("booking")
                                                }
                                                className="block w-full border-2 border-red-600 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors"
                                            >
                                                Đặt sân ngay
                                            </button>
                                        )}

                                    {!isAuthenticated && (
                                        <Link
                                            href="/auth/signin"
                                            className="block w-full border-2 border-red-600 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors text-center"
                                        >
                                            Đăng nhập để đặt sân
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Tab Headers */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6 lg:px-8">
                            {[
                                {
                                    id: "info",
                                    label: "Thông tin sân",
                                    icon: "🏟️",
                                },
                                { id: "contact", label: "Liên hệ", icon: "📞" },
                                ...(isAuthenticated
                                    ? [
                                          {
                                              id: "booking",
                                              label: "Đặt sân",
                                              icon: "📅",
                                          },
                                      ]
                                    : []),
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? "border-red-500 text-red-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 lg:p-8">
                        {activeTab === "info" && (
                            <div className="space-y-8">
                                {/* Images Gallery */}
                                <div>
                                    <h3 className="text-xl font-bold mb-4">
                                        🖼️ Hình ảnh sân
                                    </h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2">
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
                                                    {images.map(
                                                        (image, index) => (
                                                            <div
                                                                key={index}
                                                                className={`relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 ${
                                                                    selectedImage ===
                                                                    index
                                                                        ? "ring-2 ring-red-500"
                                                                        : ""
                                                                }`}
                                                                onClick={() =>
                                                                    setSelectedImage(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                <Image
                                                                    src={image}
                                                                    alt={`${
                                                                        courtDetails.name
                                                                    } ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    fill
                                                                    className="object-cover"
                                                                    onError={(
                                                                        e
                                                                    ) => {
                                                                        const target =
                                                                            e.target as HTMLImageElement;
                                                                        target.src =
                                                                            "/courts/court-placeholder.jpg";
                                                                    }}
                                                                />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {courtDetails.description && (
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">
                                            📝 Mô tả
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {courtDetails.description}
                                        </p>
                                    </div>
                                )}

                                {/* Amenities */}
                                {amenitiesList.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">
                                            🏆 Tiện ích
                                        </h3>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                            {amenitiesList.map(
                                                (amenity, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                                                    >
                                                        <svg
                                                            className="w-5 h-5 text-green-500 mr-3"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        <span className="text-gray-700">
                                                            {amenity}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "contact" && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold mb-4">
                                    📞 Thông tin liên hệ
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {courtDetails.phone && (
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <h4 className="font-medium mb-2">
                                                Số điện thoại
                                            </h4>
                                            <a
                                                href={`tel:${courtDetails.phone}`}
                                                className="text-red-600 hover:text-red-700 font-medium text-lg"
                                            >
                                                📞 {courtDetails.phone}
                                            </a>
                                        </div>
                                    )}

                                    {courtDetails.email && (
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <h4 className="font-medium mb-2">
                                                Email
                                            </h4>
                                            <a
                                                href={`mailto:${courtDetails.email}`}
                                                className="text-red-600 hover:text-red-700 font-medium"
                                            >
                                                📧 {courtDetails.email}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h4 className="font-medium text-yellow-800 mb-2">
                                        💡 Lưu ý khi đặt sân
                                    </h4>
                                    <ul className="text-yellow-700 text-sm space-y-1">
                                        <li>
                                            • Vui lòng gọi điện trước để kiểm
                                            tra tình trạng sân
                                        </li>
                                        <li>• Đặt cọc trước để giữ chỗ</li>
                                        <li>
                                            • Mang theo giày thể thao phù hợp
                                        </li>
                                        <li>• Tuân thủ quy định của sân</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === "booking" && isAuthenticated && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold mb-4">
                                    📅 Đặt sân
                                </h3>

                                {/* Booking Message */}
                                {bookingMessage && (
                                    <div
                                        className={`p-4 rounded-lg flex items-center gap-3 ${
                                            bookingMessage.type === "success"
                                                ? "bg-green-100 text-green-800 border border-green-200"
                                                : "bg-red-100 text-red-800 border border-red-200"
                                        }`}
                                    >
                                        {bookingMessage.type === "success" ? (
                                            <svg
                                                className="w-5 h-5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-5 h-5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                        <span className="font-medium">
                                            {bookingMessage.text}
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Chọn ngày đặt sân *
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) =>
                                                setSelectedDate(e.target.value)
                                            }
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            required
                                        />
                                    </div>

                                    {/* Time Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Chọn giờ đặt sân *
                                        </label>
                                        <select
                                            value={selectedTime}
                                            onChange={(e) =>
                                                setSelectedTime(e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                            required
                                        >
                                            <option value="">
                                                Chọn khung giờ
                                            </option>
                                            {timeSlots.map((slot) => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ghi chú (không bắt buộc)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        placeholder="Thêm ghi chú cho việc đặt sân..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleBooking}
                                        disabled={
                                            bookingLoading ||
                                            !selectedDate ||
                                            !selectedTime
                                        }
                                        className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {bookingLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang đặt sân...
                                            </div>
                                        ) : (
                                            "Xác nhận đặt sân"
                                        )}
                                    </button>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">
                                        ℹ️ Thông tin quan trọng
                                    </h4>
                                    <ul className="text-blue-700 text-sm space-y-1">
                                        <li>
                                            • Đặt sân chỉ là yêu cầu, cần chờ
                                            xác nhận từ chủ sân
                                        </li>
                                        <li>
                                            • Vui lòng kiểm tra lại thông tin
                                            trước khi xác nhận
                                        </li>
                                        <li>
                                            • Có thể hủy hoặc thay đổi trong
                                            phần "Lịch sử đặt sân"
                                        </li>
                                        <li>
                                            • Liên hệ trực tiếp với chủ sân để
                                            biết chính xác giá cả
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
