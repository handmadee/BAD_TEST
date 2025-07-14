"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { courtService } from "@/lib";
import type { Court, CourtSearchParams } from "@/types/api";
import { CustomSelect } from "@/components/ui";
import Header from "@/components/layout/Header";
import { CourtCard } from "@/components/ui/CourtCard";
import Map from "@/components/ui/Map";

export default function CourtsPage() {
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState<CourtSearchParams>({
        keyword: "",
        sportType: "",
        minRating: undefined,
        page: 0,
        size: 5, // 5 sân mỗi trang cho sidebar
    });
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    // Search input
    const [searchKeyword, setSearchKeyword] = useState("");

    useEffect(() => {
        loadCourts();
    }, [searchParams, userLocation]);

    // Get user location on page load
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.log("Không thể lấy vị trí:", error);
                    // Default to Da Nang center
                    setUserLocation({
                        lat: 16.0471,
                        lng: 108.2068,
                    });
                }
            );
        } else {
            // Default to Da Nang center
            setUserLocation({
                lat: 16.0471,
                lng: 108.2068,
            });
        }
    }, []);

    const loadCourts = async () => {
        setLoading(true);
        try {
            // Add user location to search params if available
            const searchParamsWithLocation = {
                ...searchParams,
                ...(userLocation && {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                }),
            };

            const response = await courtService.searchCourts(
                searchParamsWithLocation
            );
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
            size: 5,
        });
    };

    const handleCourtSelect = (court: Court) => {
        setSelectedCourt(court);
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tìm sân cầu lông
                    </h1>
                    <p className="text-gray-600">
                        Khám phá các sân cầu lông chất lượng gần bạn trên bản đồ
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên sân, địa chỉ..."
                                    value={searchKeyword}
                                    onChange={(e) =>
                                        setSearchKeyword(e.target.value)
                                    }
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
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
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
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
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
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

                {/* Main Content: Map + Court List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                    {/* Map Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="h-full">
                            <Map
                                courts={courts}
                                onCourtSelect={handleCourtSelect}
                                selectedCourt={selectedCourt}
                                userLocation={userLocation}
                                zoomToCourt={
                                    selectedCourt
                                        ? {
                                              lat: selectedCourt.latitude || 0,
                                              lng: selectedCourt.longitude || 0,
                                          }
                                        : null
                                }
                            />
                        </div>
                    </div>

                    {/* Court List Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Danh sách sân
                            </h2>
                            <span className="text-sm text-gray-500">
                                {courts.length} kết quả
                            </span>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex-1 flex justify-center items-center">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                    <span className="text-gray-600">
                                        Đang tìm kiếm sân...
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Courts List */}
                        {!loading && (
                            <div className="flex-1 flex flex-col">
                                {courts.length > 0 ? (
                                    <>
                                        <div className="flex-1 space-y-3 overflow-y-auto">
                                            {courts.map((court) => (
                                                <div
                                                    key={court.id}
                                                    className={`cursor-pointer transition-all duration-200 rounded-lg border-2 ${
                                                        selectedCourt?.id ===
                                                        court.id
                                                            ? "border-red-500 bg-red-50"
                                                            : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                                                    }`}
                                                    onClick={() =>
                                                        handleCourtSelect(court)
                                                    }
                                                >
                                                    <CourtCard court={court} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-gray-600">
                                                        Trang{" "}
                                                        {searchParams.page! + 1}{" "}
                                                        / {totalPages}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    Math.max(
                                                                        0,
                                                                        searchParams.page! -
                                                                            1
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                searchParams.page ===
                                                                0
                                                            }
                                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                                        >
                                                            ‹
                                                        </button>
                                                        <span className="text-sm text-gray-700">
                                                            {searchParams.page! +
                                                                1}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                handlePageChange(
                                                                    Math.min(
                                                                        totalPages -
                                                                            1,
                                                                        searchParams.page! +
                                                                            1
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                searchParams.page ===
                                                                totalPages - 1
                                                            }
                                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                                                        >
                                                            ›
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                                        <div className="text-4xl mb-3">🏟️</div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Không tìm thấy sân nào
                                        </h3>
                                        <p className="text-gray-600 mb-4 text-sm">
                                            Hãy thử thay đổi bộ lọc hoặc từ khóa
                                            tìm kiếm
                                        </p>
                                        <button
                                            onClick={handleResetFilters}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
