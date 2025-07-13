"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { courtService } from "@/lib";
import type { Court, CourtSearchParams } from "@/types/api";
import { CustomSelect } from "@/components/ui";
import Header from "@/components/layout/Header";
import { CourtCard } from "@/components/ui/CourtCard";

export default function CourtsPage() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState<CourtSearchParams>({
        keyword: "",
        sportType: "",
        minRating: undefined,
        page: 0,
        size: 12,
    });
    const [totalPages, setTotalPages] = useState(0);

    // Search input
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        loadCourts();
    }, [searchParams]);

    const loadCourts = async () => {
        setLoading(true);
        try {
            const response = await courtService.searchCourts(searchParams);
            setCourts(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sân:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({
            ...searchParams,
            keyword: searchKeyword,
            page: 0,
        });
    };

    const handleFilterChange = (key: keyof CourtSearchParams, value: any) => {
        setSearchParams({
            ...searchParams,
            [key]: value,
            page: 0, // Reset to first page when filters change
        });
    };

    const handlePageChange = (page: number) => {
        setSearchParams({
            ...searchParams,
            page,
        });
    };

    const handleResetFilters = () => {
        setSearchKeyword("");
        setSearchParams({
            keyword: "",
            sportType: "",
            minRating: undefined,
            page: 0,
            size: 12,
        });
    };

    const sportOptions = [
        { value: "", label: "Tất cả môn thể thao" },
        { value: "Cầu lông", label: "Cầu lông" },
        { value: "Pickleball", label: "Pickleball" },
        { value: "Cả hai", label: "Cả hai" },
    ];

    const ratingOptions = [
        { value: "", label: "Tất cả đánh giá" },
        { value: "4", label: "4+ sao" },
        { value: "3", label: "3+ sao" },
        { value: "2", label: "2+ sao" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Tìm sân cầu lông
                    </h1>
                    <p className="text-lg text-gray-600">
                        Khám phá các sân cầu lông chất lượng gần bạn
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên sân, địa chỉ..."
                                    value={searchKeyword}
                                    onChange={(e) =>
                                        setSearchKeyword(e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-red-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
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
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <CustomSelect
                                label="Môn thể thao"
                                value={searchParams.sportType || ""}
                                onChange={(value) =>
                                    handleFilterChange(
                                        "sportType",
                                        value || undefined
                                    )
                                }
                                options={sportOptions}
                                className="flex-1"
                            />

                            <CustomSelect
                                label="Đánh giá tối thiểu"
                                value={searchParams.minRating?.toString() || ""}
                                onChange={(value) =>
                                    handleFilterChange(
                                        "minRating",
                                        value ? parseInt(value) : undefined
                                    )
                                }
                                options={ratingOptions}
                                className="flex-1"
                            />
                        </div>

                        <button
                            onClick={handleResetFilters}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Đặt lại
                        </button>
                    </div>
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Danh sách sân ({courts.length} kết quả)
                    </h2>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        <span className="ml-3 text-gray-600">
                            Đang tìm kiếm sân...
                        </span>
                    </div>
                )}

                {/* Courts Grid */}
                {!loading && (
                    <>
                        {courts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {courts.map((court) => (
                                    <CourtCard key={court.id} court={court} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🏟️</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Không tìm thấy sân nào
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Hãy thử thay đổi bộ lọc hoặc từ khóa tìm
                                    kiếm
                                </p>
                                <button
                                    onClick={handleResetFilters}
                                    className="bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    {/* Pagination Info */}
                                    <div className="text-sm text-gray-600">
                                        Trang{" "}
                                        <span className="font-semibold text-gray-900">
                                            {searchParams.page! + 1}
                                        </span>{" "}
                                        trong tổng số{" "}
                                        <span className="font-semibold text-gray-900">
                                            {totalPages}
                                        </span>{" "}
                                        trang
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    Math.max(
                                                        0,
                                                        searchParams.page! - 1
                                                    )
                                                )
                                            }
                                            disabled={searchParams.page === 0}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 19l-7-7 7-7"
                                                />
                                            </svg>
                                            Trước
                                        </button>

                                        {/* Page Numbers */}
                                        <div className="flex gap-1">
                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        totalPages
                                                    ),
                                                },
                                                (_, index) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = index;
                                                    } else if (
                                                        searchParams.page! < 3
                                                    ) {
                                                        pageNum = index;
                                                    } else if (
                                                        searchParams.page! >
                                                        totalPages - 4
                                                    ) {
                                                        pageNum =
                                                            totalPages -
                                                            5 +
                                                            index;
                                                    } else {
                                                        pageNum =
                                                            searchParams.page! -
                                                            2 +
                                                            index;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    pageNum
                                                                )
                                                            }
                                                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                                searchParams.page ===
                                                                pageNum
                                                                    ? "bg-red-600 text-white"
                                                                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                                            }`}
                                                        >
                                                            {pageNum + 1}
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>

                                        <button
                                            onClick={() =>
                                                handlePageChange(
                                                    Math.min(
                                                        totalPages - 1,
                                                        searchParams.page! + 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                searchParams.page ===
                                                totalPages - 1
                                            }
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Sau
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Quick Actions */}
                <div className="mt-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold mb-4">
                            Không tìm thấy sân phù hợp?
                        </h3>
                        <p className="text-lg mb-6 opacity-90">
                            Hãy thử những gợi ý sau để tìm kiếm tốt hơn
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                <div className="text-3xl mb-2">🔍</div>
                                <h4 className="font-semibold mb-1">
                                    Mở rộng tìm kiếm
                                </h4>
                                <p className="text-sm opacity-90">
                                    Thử từ khóa khác hoặc bỏ bộ lọc
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                <div className="text-3xl mb-2">📍</div>
                                <h4 className="font-semibold mb-1">
                                    Tìm theo địa điểm
                                </h4>
                                <p className="text-sm opacity-90">
                                    Tìm kiếm theo quận, phường gần bạn
                                </p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-xl p-4">
                                <div className="text-3xl mb-2">⭐</div>
                                <h4 className="font-semibold mb-1">
                                    Giảm yêu cầu
                                </h4>
                                <p className="text-sm opacity-90">
                                    Thử giảm mức đánh giá tối thiểu
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
