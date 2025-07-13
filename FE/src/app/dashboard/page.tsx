"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import Image from "next/image";
import { authService, courtService } from "@/lib";
import type { User, Court } from "@/types/api";

export default function DashboardPage() {
    const [selectedType, setSelectedType] = useState("badminton");
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // State cho API data
    const [user, setUser] = useState<User | null>(null);
    const [courtTypes, setCourtTypes] = useState<any[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);

    // Load data khi component mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [userResponse, typesResponse, courtsResponse] =
                await Promise.all([
                    authService.getCurrentUser(),
                    courtService.getCourtTypes(),
                    courtService.getCourts({ page: 0, size: 4 }), // Chỉ lấy 4 sân cho dashboard
                ]);

            setUser(userResponse.data);
            setCourtTypes(typesResponse.data);
            setCourts(courtsResponse.data.content || []);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute requiredRole="COURT_OWNER">
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#c0162d] mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                            Đang tải dữ liệu...
                        </p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole="COURT_OWNER">
            <div className="min-h-screen bg-gray-50">
                <Header />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Hero Banner */}
                    <div className="relative w-full h-[300px] rounded-2xl overflow-hidden mb-8">
                        <Image
                            src="/badminton-banner.jpg"
                            alt="Badminton Courts"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                            <div className="text-white p-8">
                                <h1 className="text-4xl font-bold mb-4">
                                    Tìm sân cầu lông
                                </h1>
                                <p className="text-xl mb-6">
                                    Đặt sân nhanh chóng, tiện lợi
                                </p>
                                <button className="bg-[#c0162d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a01325] transition-colors">
                                    Đặt sân ngay
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Court Type Selection */}
                    <div className="flex overflow-x-auto space-x-4 pb-4 mb-6">
                        {courtTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium ${
                                    type.id === selectedType
                                        ? "bg-[#c0162d] text-white"
                                        : "bg-white text-black border border-gray-200"
                                }`}
                            >
                                {type.name}
                            </button>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <div className="flex items-center">
                                <span className="text-gray-600 text-sm">
                                    Tất cả dịch vụ
                                </span>
                                <svg
                                    className="w-4 h-4 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm">
                                    Ngày bắt đầu
                                </span>
                                <svg
                                    className="w-5 h-5 text-gray-600"
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
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm">
                                    Ngày kết thúc
                                </span>
                                <svg
                                    className="w-5 h-5 text-gray-600"
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
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="bg-white rounded-xl p-6 mb-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4">
                                <div className="flex items-center">
                                    <div className="w-2 h-5 bg-[#f765a3] rounded-full mr-3"></div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Đơn hàng order
                                        </p>
                                        <p className="text-xl font-bold">
                                            1223
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center">
                                    <div className="w-2 h-5 bg-[#16bfd6] rounded-full mr-3"></div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Đơn hàng ký gửi
                                        </p>
                                        <p className="text-xl font-bold">100</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center">
                                    <div className="w-2 h-5 bg-[#d9f7be] rounded-full mr-3"></div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Đơn hàng ngoại hối
                                        </p>
                                        <p className="text-xl font-bold">15</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center">
                                    <div className="w-2 h-5 bg-[#ffa39e] rounded-full mr-3"></div>
                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Đơn hàng chính ngạch
                                        </p>
                                        <p className="text-xl font-bold">20</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Court Listings */}
                    <h2 className="text-2xl font-bold mb-4">Danh sách sân</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courts.map((court) => (
                            <Link
                                href={`/dashboard/courts/${court.id}`}
                                key={court.id}
                            >
                                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="relative h-48">
                                        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-sm font-medium z-10">
                                            {court.status === "ACTIVE"
                                                ? "Hoạt động"
                                                : "Bảo trì"}
                                        </div>
                                        <Image
                                            src={
                                                (court.images &&
                                                    court.images[0]) ||
                                                "/courts/court-placeholder.jpg"
                                            }
                                            alt={court.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-1">
                                            {court.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-2">
                                            {court.address}
                                        </p>
                                        <div className="flex items-center mb-2">
                                            <svg
                                                className="w-5 h-5 text-yellow-500"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm font-medium ml-1">
                                                {court.averageRating ||
                                                    "Chưa có"}
                                            </span>
                                            <span className="text-gray-500 text-sm ml-1">
                                                ({court.totalReviews || 0} đánh
                                                giá)
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">
                                                {court.operatingHours ||
                                                    "Liên hệ"}
                                            </span>
                                            <span className="text-[#c0162d] font-semibold">
                                                Liên hệ
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">
                                    ZONEHUB
                                </h3>
                                <p className="text-gray-300 mb-4">
                                    Dịch vụ quản lý sân cầu lông nhanh chóng &
                                    chính xác nhất
                                </p>
                                <p className="text-gray-400 text-sm">
                                    © 2024 Badminton Court Management. All
                                    rights reserved.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-4">
                                    Thông tin liên hệ
                                </h3>
                                <div className="space-y-2">
                                    <p className="flex items-center text-gray-300">
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
                                        098 898 9899
                                    </p>
                                    <p className="flex items-center text-gray-300">
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
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                        contact@badminton.com
                                    </p>
                                    <p className="flex items-center text-gray-300">
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
                                        123 Đường Hoàng Diệu, Q. Hải Châu, Đà
                                        Nẵng
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-4">
                                    Kết nối với chúng tôi
                                </h3>
                                <div className="flex space-x-4">
                                    <a
                                        href="#"
                                        className="bg-white p-2 rounded-lg"
                                    >
                                        <svg
                                            className="w-5 h-5 text-gray-900"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="#"
                                        className="bg-white p-2 rounded-lg"
                                    >
                                        <svg
                                            className="w-5 h-5 text-gray-900"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
}
