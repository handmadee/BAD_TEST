"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { authService, courtService, teamService } from "@/lib";
import type { TeamPost, User } from "@/types/api";
import { TeamPostCard, CustomSelect } from "@/components/ui";
import { getFullImageUrl } from "@/utils";
import Header from "@/components/layout/Header";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export default function HomePage() {
    // State management
    const [user, setUser] = useState<User | null>(null);
    const [teamPosts, setTeamPosts] = useState<TeamPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDateRange, setShowDateRange] = useState(false);
    const dateRangeRef = useRef<HTMLDivElement>(null);
    const [dashboardStats, setDashboardStats] = useState({
        totalTeamPosts: 0,
        activePosts: 0,
        totalCourts: 0,
        totalBookings: 0,
    });

    // Filter states
    const [filters, setFilters] = useState({
        sport: "" as "Cầu lông" | "Pickleball" | "",
        skill_level: "",
        date: "",
        end_date: "",
        page: 1,
        limit: 10,
    });

    // Date range state
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);

    const [pagination, setPagination] = useState({
        totalPages: 1,
        total: 0,
    });

    // Options cho dropdowns
    const sportOptions = [
        { value: "", label: "Tất cả bài đăng" },
        { value: "BADMINTON", label: "Cầu lông" },
        { value: "PICKLEBALL", label: "Pickleball" },
    ];

    const skillOptions = [
        { value: "", label: "Tất cả trình độ" },
        { value: "WEAK", label: "Yếu" },
        { value: "AVERAGE", label: "Trung bình" },
        { value: "GOOD", label: "Khá" },
        { value: "EXCELLENT", label: "Giỏi" },
    ];

    const limitOptions = [
        { value: "10", label: "10 bài" },
        { value: "20", label: "20 bài" },
        { value: "30", label: "30 bài" },
    ];

    // Load data
    useEffect(() => {
        loadData();
    }, [filters]);

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dateRangeRef.current &&
                !dateRangeRef.current.contains(event.target as Node)
            ) {
                setShowDateRange(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load user và stats
            const [userResponse, statsResponse] = await Promise.all([
                authService.getCurrentUser(),
                courtService.getDashboardStats(),
            ]);

            setUser(userResponse.data);
            setDashboardStats(statsResponse.data);

            // Prepare filters for API call
            const filtersToSend = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== "")
            );

            // Điều chỉnh page để bắt đầu từ 0
            const apiPage = filters.page - 1;

            let postsResponse;

            // Check if we have any search filters (excluding pagination)
            const hasSearchFilters = Object.keys(filtersToSend).some(
                (key) =>
                    key !== "page" &&
                    key !== "limit" &&
                    filtersToSend[key] !== ""
            );

            if (hasSearchFilters) {
                // Use search API when there are filters
                const searchParams = {
                    keyword: filtersToSend.keyword?.toString() || "",
                    sport: filtersToSend.sport?.toString() || "",
                    skillLevel: filtersToSend.skill_level?.toString() || "",
                    location: filtersToSend.location?.toString() || "",
                    date: filtersToSend.date?.toString() || "",
                    page: apiPage,
                    size: parseInt(filters.limit.toString()),
                };
                postsResponse = await teamService.searchTeamPosts(searchParams);
            } else {
                // Use simple getAllTeamPosts when no filters
                postsResponse = await teamService.getTeamPosts({
                    page: apiPage,
                    size: parseInt(filters.limit.toString()),
                });
            }

            console.log("API Response:", postsResponse); // Kiểm tra response
            console.log("Team Posts:", postsResponse.data.content); // Kiểm tra content
            setTeamPosts(postsResponse.data.content || []);
            setPagination({
                totalPages: postsResponse.data.totalPages,
                total: postsResponse.data.totalElements,
            });
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1, // Reset về trang 1 khi filter
        }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
    };

    const handleDateRangeChange = (ranges: any) => {
        setDateRange([ranges.selection]);
        // Cập nhật filters với date range
        const startDate = format(ranges.selection.startDate, "yyyy-MM-dd");
        const endDate = format(ranges.selection.endDate, "yyyy-MM-dd");
        setFilters((prev) => ({
            ...prev,
            date: startDate,
            end_date: endDate,
            page: 1,
        }));
        setShowDateRange(false); // Đóng date picker sau khi chọn
    };

    const handleResetFilters = () => {
        setFilters({
            sport: "",
            skill_level: "",
            date: "",
            end_date: "",
            page: 1,
            limit: 10,
        });
        setDateRange([
            {
                startDate: new Date(),
                endDate: new Date(),
                key: "selection",
            },
        ]);
        setShowDateRange(false);
    };

    const getDateRangeText = () => {
        const start = dateRange[0].startDate;
        const end = dateRange[0].endDate;

        if (start.toDateString() === end.toDateString()) {
            return format(start, "dd/MM/yyyy", { locale: vi });
        }

        return `${format(start, "dd/MM/yyyy", { locale: vi })} - ${format(
            end,
            "dd/MM/yyyy",
            { locale: vi }
        )}`;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header mới */}
            <Header />

            {/* Main Content responsive */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 lg:py-10">
                {/* Filters responsive */}
                <div className="mb-8 lg:mb-12">
                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                        <span className="text-xl lg:text-2xl font-bold text-gray-900">
                            Bộ lọc
                        </span>
                        <button
                            onClick={handleResetFilters}
                            className="flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl lg:rounded-2xl transition-colors text-sm lg:text-base font-semibold"
                        >
                            <RotateCcw className="w-4 h-4 lg:w-5 lg:h-5" />
                            <span className="hidden sm:inline">Đặt lại</span>
                        </button>
                    </div>

                    {/* Filters layout responsive */}
                    <div className="space-y-6 lg:space-y-0">
                        {/* Mobile: Stack vertically, Desktop: Horizontal */}
                        <div className="flex flex-col sm:flex-row gap-4 lg:gap-8 mb-6 lg:mb-8">
                            {/* Môn thể thao */}
                            <CustomSelect
                                label="Môn thể thao"
                                value={filters.sport}
                                onChange={(value) =>
                                    handleFilterChange("sport", value)
                                }
                                options={sportOptions}
                                className="flex-1 min-w-0"
                            />

                            {/* Trình độ */}
                            <CustomSelect
                                label="Trình độ"
                                value={filters.skill_level}
                                onChange={(value) =>
                                    handleFilterChange("skill_level", value)
                                }
                                options={skillOptions}
                                className="flex-1 min-w-0"
                            />

                            {/* Thời gian - Date Range Picker - ẩn trên mobile */}
                            <div
                                className="hidden lg:flex flex-col gap-3 relative flex-1"
                                ref={dateRangeRef}
                            >
                                <label className="text-base font-bold text-gray-700">
                                    Thời gian
                                </label>
                                <button
                                    onClick={() =>
                                        setShowDateRange(!showDateRange)
                                    }
                                    className={`
                                        flex items-center gap-4 px-6 lg:px-8 py-3 lg:py-5 text-base lg:text-lg 
                                        bg-white rounded-2xl lg:rounded-3xl transition-all shadow-sm hover:shadow-md
                                        ${
                                            showDateRange
                                                ? "shadow-md ring-2 ring-red-200 bg-red-50"
                                                : ""
                                        }
                                        focus:outline-none focus:ring-2 focus:ring-red-200
                                        text-left
                                    `}
                                >
                                    <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                                    <span className="text-gray-700">
                                        {getDateRangeText()}
                                    </span>
                                </button>

                                {showDateRange && (
                                    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                        <DateRange
                                            ranges={dateRange}
                                            onChange={handleDateRangeChange}
                                            moveRangeOnFirstSelection={false}
                                            months={2}
                                            direction="horizontal"
                                            locale={vi}
                                            weekStartsOn={1}
                                            showDateDisplay={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tầng dưới: Chế độ xem và Phân trang - responsive */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                            {/* Chế độ xem - responsive */}
                            <div className="flex flex-col gap-2 lg:gap-3">
                                <label className="text-sm lg:text-base font-bold text-gray-700">
                                    Chế độ xem
                                </label>
                                <select
                                    value={filters.limit}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "limit",
                                            e.target.value
                                        )
                                    }
                                    className="px-4 lg:px-8 py-3 lg:py-5 text-base lg:text-lg bg-blue-600 text-white rounded-2xl lg:rounded-3xl focus:outline-none font-bold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md border-0"
                                >
                                    <option value="10">10 bài</option>
                                    <option value="20">20 bài</option>
                                    <option value="30">30 bài</option>
                                </select>
                            </div>

                            {/* Phân trang với nút điều hướng - responsive */}
                            <div className="flex flex-col gap-2 lg:gap-3">
                                <label className="text-sm lg:text-base font-bold text-gray-700">
                                    Trang
                                </label>
                                <div className="flex items-center gap-2 lg:gap-4">
                                    <button
                                        onClick={() =>
                                            handlePageChange(
                                                Math.max(1, filters.page - 1)
                                            )
                                        }
                                        disabled={filters.page <= 1}
                                        className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded-xl lg:rounded-2xl transition-colors shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4 lg:w-6 lg:h-6" />
                                    </button>

                                    <div className="flex items-center gap-1 lg:gap-2">
                                        <div className="px-3 lg:px-6 py-2 lg:py-3 border-2 border-blue-500 rounded-xl lg:rounded-2xl text-blue-600 font-bold bg-blue-50 text-base lg:text-lg min-w-12 lg:min-w-16 text-center">
                                            {filters.page}
                                        </div>
                                        <span className="text-gray-500 text-base lg:text-lg font-medium">
                                            /
                                        </span>
                                        <div className="px-3 lg:px-6 py-2 lg:py-3 text-gray-600 font-bold text-base lg:text-lg min-w-12 lg:min-w-16 text-center">
                                            {pagination.totalPages}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handlePageChange(
                                                Math.min(
                                                    pagination.totalPages,
                                                    filters.page + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            filters.page >=
                                            pagination.totalPages
                                        }
                                        className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded-xl lg:rounded-2xl transition-colors shadow-sm"
                                    >
                                        <ChevronRight className="w-4 h-4 lg:w-6 lg:h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts List với spacing lớn hơn */}
                <div className="space-y-8">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                            <p className="mt-6 text-lg text-gray-600">
                                Đang tải...
                            </p>
                        </div>
                    ) : teamPosts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-lg text-gray-600">
                                Không tìm thấy bài đăng
                            </p>
                        </div>
                    ) : (
                        teamPosts.map((post) => (
                            <TeamPostCard key={post.id} post={post} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
