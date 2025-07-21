"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { authService, bookingService } from "@/lib";
import { fakeBookingService } from "@/lib/fake-booking-service";
import type { Booking, User } from "@/types/api";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CustomSelect } from "@/components/ui";
import {
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    CheckCircle,
    AlertCircle,
    XCircle,
    Phone,
    Star,
    Filter,
    TrendingUp,
} from "lucide-react";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        try {
            // Load fake bookings from localStorage first
            const fakeBookings = fakeBookingService.getAllBookings();

            // Try to load real bookings from API
            let realBookings: Booking[] = [];
            try {
                const response = await bookingService.getMyBookings();
                realBookings = response.data.content || [];
            } catch (error) {
                console.log("Could not load real bookings, using fake data only:", error);
            }

            // Combine fake and real bookings, fake bookings first for demo
            const allBookings = [...fakeBookings, ...realBookings];
            setBookings(allBookings);
        } catch (error) {
            console.error("Error loading bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    // Tính thống kê từ bookings
    const getStatistics = () => {
        const totalBookings = bookings.length;
        const confirmedBookings = bookings.filter(
            (b) => b.status === "CONFIRMED"
        ).length;
        const completedBookings = bookings.filter(
            (b) => b.status === "COMPLETED"
        ).length;
        const cancelledBookings = bookings.filter(
            (b) => b.status === "CANCELLED"
        ).length;
        const totalSpent = bookings
            .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
            .reduce((sum, b) => sum + b.totalPrice, 0);

        return {
            totalBookings,
            confirmedBookings,
            completedBookings,
            cancelledBookings,
            totalSpent,
        };
    };

    const statistics = getStatistics();

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: {
                bg: "bg-yellow-100",
                text: "text-yellow-800",
                icon: AlertCircle,
            },
            CONFIRMED: {
                bg: "bg-blue-100",
                text: "text-blue-800",
                icon: CheckCircle,
            },
            COMPLETED: {
                bg: "bg-green-100",
                text: "text-green-800",
                icon: CheckCircle,
            },
            CANCELLED: {
                bg: "bg-red-100",
                text: "text-red-800",
                icon: XCircle,
            },
        };

        const labels = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            COMPLETED: "Đã hoàn thành",
            CANCELLED: "Đã hủy",
        };

        const style = styles[status as keyof typeof styles];
        const Icon = style?.icon || AlertCircle;

        return (
            <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${style?.bg} ${style?.text}`}
            >
                <Icon className="w-4 h-4" />
                {labels[status as keyof typeof labels]}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    // Helper function to calculate price per hour estimate
    const calculatePricePerHour = (booking: Booking) => {
        try {
            const startTime = new Date(`2024-01-01 ${booking.startTime}`);
            const endTime = new Date(`2024-01-01 ${booking.endTime}`);
            const duration =
                (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

            if (duration > 0) {
                return Math.round(booking.totalPrice / duration);
            }
        } catch (error) {
            console.error("Error calculating price per hour:", error);
        }
        return booking.totalPrice; // fallback
    };

    // Tạo options cho date filter
    const getDateFilterOptions = () => {
        return [
            { value: "all", label: "Tất cả thời gian" },
            { value: "today", label: "Hôm nay" },
            { value: "yesterday", label: "Hôm qua" },
            { value: "thisWeek", label: "Tuần này" },
            { value: "thisMonth", label: "Tháng này" },
            { value: "lastMonth", label: "Tháng trước" },
        ];
    };

    // Status filter options - sử dụng đúng backend status values
    const statusFilterOptions = [
        { value: "all", label: "Tất cả trạng thái" },
        { value: "PENDING", label: "Chờ xác nhận" },
        { value: "CONFIRMED", label: "Đã xác nhận" },
        { value: "COMPLETED", label: "Đã hoàn thành" },
        { value: "CANCELLED", label: "Đã hủy" },
    ];

    // Filter bookings by date
    const filterByDate = (booking: Booking) => {
        if (dateFilter === "all") return true;

        const bookingDate = new Date(booking.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
            case "today":
                const todayStr = today.toDateString();
                return bookingDate.toDateString() === todayStr;

            case "yesterday":
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return bookingDate.toDateString() === yesterday.toDateString();

            case "thisWeek":
                const thisWeekStart = new Date(today);
                thisWeekStart.setDate(today.getDate() - today.getDay());
                const thisWeekEnd = new Date(thisWeekStart);
                thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
                return (
                    bookingDate >= thisWeekStart && bookingDate <= thisWeekEnd
                );

            case "thisMonth":
                const thisMonthStart = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );
                const thisMonthEnd = new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    0
                );
                return (
                    bookingDate >= thisMonthStart && bookingDate <= thisMonthEnd
                );

            case "lastMonth":
                const lastMonthStart = new Date(
                    today.getFullYear(),
                    today.getMonth() - 1,
                    1
                );
                const lastMonthEnd = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    0
                );
                return (
                    bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd
                );

            default:
                return true;
        }
    };

    const filteredBookings = bookings
        .filter(
            (booking) =>
                statusFilter === "all" || booking.status === statusFilter
        )
        .filter(filterByDate);

    const handleResetFilters = () => {
        setStatusFilter("all");
        setDateFilter("all");
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Header />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-red-600 mb-4">
                            Danh sách sân đã đặt
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Quản lý và theo dõi các lần đặt sân cầu lông,
                            pickleball của bạn
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Tổng số lần đặt */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-gray-600 text-sm font-medium mb-2">
                                        Tổng số lần đặt sân
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {statistics.totalBookings}
                                    </p>
                                </div>
                                <div className="w-2 h-12 bg-pink-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Đã xác nhận */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-gray-600 text-sm font-medium mb-2">
                                        Đã xác nhận
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {statistics.confirmedBookings}
                                    </p>
                                </div>
                                <div className="w-2 h-12 bg-green-500 rounded-full"></div>
                            </div>
                        </div>

                        {/* Đã hủy */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-gray-600 text-sm font-medium mb-2">
                                        Đã hủy
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {statistics.cancelledBookings}
                                    </p>
                                </div>
                                <div className="w-2 h-12 bg-red-400 rounded-full"></div>
                            </div>
                        </div>

                        {/* Tổng chi tiêu */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-gray-600 text-sm font-medium mb-2">
                                        Tổng chi tiêu
                                    </p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {formatPrice(statistics.totalSpent)}
                                    </p>
                                </div>
                                <div className="w-2 h-12 bg-orange-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1">
                                <CustomSelect
                                    label="Lọc theo trạng thái"
                                    value={statusFilter}
                                    onChange={(value) => setStatusFilter(value)}
                                    options={statusFilterOptions}
                                />
                            </div>

                            <div className="flex-1">
                                <CustomSelect
                                    label="Lọc theo ngày chơi"
                                    value={dateFilter}
                                    onChange={(value) => setDateFilter(value)}
                                    options={getDateFilterOptions()}
                                />
                            </div>

                            <div className="flex-shrink-0">
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
                                >
                                    Đặt lại bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bookings List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                            <p className="mt-4 text-gray-600 text-lg">
                                Đang tải danh sách đặt sân...
                            </p>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {statusFilter === "all" && dateFilter === "all"
                                    ? "Chưa có đặt sân nào"
                                    : "Không tìm thấy đặt sân"}
                            </h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                {statusFilter === "all" && dateFilter === "all"
                                    ? "Bạn chưa đặt sân nào. Hãy tìm và đặt sân yêu thích của bạn!"
                                    : "Không có đặt sân nào với bộ lọc này."}
                            </p>
                            {statusFilter === "all" && dateFilter === "all" && (
                                <Link
                                    href="/courts"
                                    className="inline-block bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors"
                                >
                                    Tìm sân để đặt
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    Đặt sân #{booking.id}
                                                </h3>
                                                {getStatusBadge(booking.status)}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-500">
                                                            Môn thể thao
                                                        </p>
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {booking.court
                                                                .sportTypes ||
                                                                "Cầu lông"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-500">
                                                            Ngày chơi
                                                        </p>
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {formatDate(
                                                                booking.bookingDate
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-5 h-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-500">
                                                            Thời gian
                                                        </p>
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {booking.startTime}{" "}
                                                            - {booking.endTime}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <DollarSign className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-500">
                                                            Tổng tiền
                                                        </p>
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {formatPrice(
                                                                booking.totalPrice
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-500">
                                                            Ngày đặt
                                                        </p>
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {formatDate(
                                                                booking.createdAt
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <DollarSign className="w-5 h-5 text-yellow-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-500">
                                                            Ước tính/giờ
                                                        </p>
                                                        <p className="font-semibold text-gray-900 truncate">
                                                            {formatPrice(
                                                                calculatePricePerHour(
                                                                    booking
                                                                )
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Thông tin sân */}
                                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-600" />
                                                    Thông tin sân
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">
                                                            Tên sân
                                                        </p>
                                                        <p className="font-medium text-gray-900">
                                                            {booking.court.name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">
                                                            Địa chỉ
                                                        </p>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                booking.court
                                                                    .address
                                                            }
                                                        </p>
                                                    </div>
                                                    {booking.court.phone && (
                                                        <div className="sm:col-span-2">
                                                            <p className="text-sm text-gray-500 mb-1">
                                                                Số điện thoại
                                                            </p>
                                                            <a
                                                                href={`tel:${booking.court.phone}`}
                                                                className="font-medium text-blue-600 hover:text-blue-800"
                                                            >
                                                                {
                                                                    booking
                                                                        .court
                                                                        .phone
                                                                }
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notes nếu có */}
                                            {booking.notes && (
                                                <div className="bg-blue-50 rounded-xl p-4">
                                                    <h5 className="font-medium text-gray-900 mb-2">
                                                        Ghi chú
                                                    </h5>
                                                    <p className="text-gray-700">
                                                        {booking.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3 lg:flex-shrink-0 lg:w-48">
                                            {booking.status === "CONFIRMED" && (
                                                <>
                                                    <button className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-center">
                                                        Liên hệ sân
                                                    </button>
                                                    <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-center">
                                                        Xem chi tiết
                                                    </button>
                                                </>
                                            )}

                                            {booking.status === "COMPLETED" && (
                                                <>
                                                    <button className="w-full px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2">
                                                        <Star className="w-4 h-4" />
                                                        Đánh giá sân
                                                    </button>
                                                    <Link
                                                        href={`/courts/${booking.court.id}`}
                                                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-center"
                                                    >
                                                        Đặt lại sân này
                                                    </Link>
                                                </>
                                            )}

                                            {booking.status === "CANCELLED" && (
                                                <>
                                                    <Link
                                                        href={`/courts/${booking.court.id}`}
                                                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-center"
                                                    >
                                                        Đặt lại sân này
                                                    </Link>
                                                    <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-center">
                                                        Xem chi tiết
                                                    </button>
                                                </>
                                            )}

                                            {booking.status === "PENDING" && (
                                                <>
                                                    <button className="w-full px-6 py-3 bg-gray-500 text-white rounded-xl cursor-not-allowed opacity-75 font-medium text-center">
                                                        Chờ xác nhận
                                                    </button>
                                                    <button className="w-full px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium text-center">
                                                        Hủy đặt sân
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            Thao tác nhanh
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link
                                href="/courts"
                                className="group bg-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-red-700 transition-all text-center transform hover:scale-105"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Calendar className="w-6 h-6" />
                                    Đặt sân mới
                                </div>
                            </Link>

                            <Link
                                href="/create-team"
                                className="group bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all text-center transform hover:scale-105"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <TrendingUp className="w-6 h-6" />
                                    Tạo bài tìm đội
                                </div>
                            </Link>

                            <Link
                                href="/"
                                className="group border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all text-center transform hover:scale-105"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <MapPin className="w-6 h-6" />
                                    Xem bài đăng
                                </div>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
