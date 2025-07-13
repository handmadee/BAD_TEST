"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { courtService } from "@/lib";
import type { Court, CreateCourtRequest } from "@/types/api";
import { CourtCard } from "@/components/ui/CourtCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"manage" | "create">("manage");
    const [courts, setCourts] = useState<Court[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [creating, setCreating] = useState(false);

    // Form states cho tạo sân mới
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        description: "",
        phone: "",
        email: "",
        operatingHours: "",
        sportTypes: "Cầu lông",
        amenities: "",
        images: [] as string[],
        latitude: 0,
        longitude: 0,
    });

    const [newAmenity, setNewAmenity] = useState("");
    const [formMessage, setFormMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    useEffect(() => {
        loadCourts();
    }, []);

    const loadCourts = async () => {
        try {
            setLoading(true);
            const response = await courtService.getCourts();
            const courtsData = response.data;
            setCourts(courtsData.content || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sân:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourts = courts.filter(
        (court) =>
            court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            court.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const addAmenity = () => {
        if (newAmenity.trim()) {
            const currentAmenities = formData.amenities
                ? formData.amenities.split(",").map((s) => s.trim())
                : [];

            if (!currentAmenities.includes(newAmenity.trim())) {
                const updatedAmenities = [
                    ...currentAmenities,
                    newAmenity.trim(),
                ];
                setFormData((prev) => ({
                    ...prev,
                    amenities: updatedAmenities.join(", "),
                }));
                setNewAmenity("");
            }
        }
    };

    const removeAmenity = (amenity: string) => {
        const currentAmenities = formData.amenities
            ? formData.amenities.split(",").map((s) => s.trim())
            : [];

        const updatedAmenities = currentAmenities.filter((a) => a !== amenity);
        setFormData((prev) => ({
            ...prev,
            amenities: updatedAmenities.join(", "),
        }));
    };

    const getAmenitiesArray = () => {
        return formData.amenities
            ? formData.amenities
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0)
            : [];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormMessage(null);

        // Validation cơ bản
        if (!formData.name || !formData.address) {
            setFormMessage({
                type: "error",
                text: "Vui lòng điền đầy đủ thông tin bắt buộc (Tên sân và Địa chỉ)!",
            });
            return;
        }

        setCreating(true);

        try {
            // Tạo object court mới theo đúng interface CreateCourtRequest
            const newCourtData: CreateCourtRequest = {
                name: formData.name,
                address: formData.address,
                description: formData.description || undefined,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
                operatingHours: formData.operatingHours || undefined,
                sportTypes: formData.sportTypes,
                amenities: formData.amenities || undefined,
                images:
                    formData.images.length > 0 ? formData.images : undefined,
                latitude: formData.latitude || undefined,
                longitude: formData.longitude || undefined,
            };

            // Gọi API tạo sân mới
            const response = await courtService.createCourt(newCourtData);

            setFormMessage({
                type: "success",
                text: "Tạo sân thành công!",
            });

            // Reset form
            setFormData({
                name: "",
                address: "",
                description: "",
                phone: "",
                email: "",
                operatingHours: "",
                sportTypes: "Cầu lông",
                amenities: "",
                images: [],
                latitude: 0,
                longitude: 0,
            });

            // Reload danh sách sân
            await loadCourts();

            // Chuyển về tab quản lý sau 2 giây
            setTimeout(() => {
                setActiveTab("manage");
                setFormMessage(null);
            }, 2000);
        } catch (error: any) {
            console.error("Lỗi khi tạo sân:", error);

            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Có lỗi xảy ra khi tạo sân!";

            setFormMessage({
                type: "error",
                text: errorMessage,
            });
        } finally {
            setCreating(false);
        }
    };

    const getActiveCourts = () =>
        courts.filter((court) => court.status === "ACTIVE");
    const getAverageRating = () => {
        if (courts.length === 0) return 0;
        const validRatings = courts.filter(
            (c) => c.averageRating && c.averageRating > 0
        );
        if (validRatings.length === 0) return 0;
        return (
            validRatings.reduce((sum, c) => sum + (c.averageRating || 0), 0) /
            validRatings.length
        );
    };

    return (
        <ProtectedRoute requiredRole="COURT_OWNER">
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                    <svg
                                        className="w-5 h-5 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                    Admin Dashboard
                                </span>
                            </div>

                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
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
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab("manage")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === "manage"
                                        ? "border-red-500 text-red-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center gap-2">
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
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                    </svg>
                                    Quản lý sân ({courts.length})
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("create")}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === "create"
                                        ? "border-red-500 text-red-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center gap-2">
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
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    Tạo sân mới
                                </div>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {activeTab === "manage" ? (
                        <div>
                            {/* Header quản lý sân */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        Quản lý sân
                                    </h1>
                                    <p className="text-gray-600">
                                        Danh sách tất cả các sân trong hệ thống
                                    </p>
                                </div>

                                <div className="mt-4 sm:mt-0 sm:w-80">
                                    <Input
                                        placeholder="Tìm kiếm sân..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
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
                                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Tổng số sân
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {courts.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
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
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Sân hoạt động
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {getActiveCourts().length}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
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
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">
                                                Đánh giá trung bình
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {getAverageRating().toFixed(1)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách sân */}
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                    <span className="ml-3 text-gray-600">
                                        Đang tải...
                                    </span>
                                </div>
                            ) : filteredCourts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCourts.map((court) => (
                                        <CourtCard
                                            key={court.id}
                                            court={court}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        Không tìm thấy sân nào
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchTerm
                                            ? "Thử tìm kiếm với từ khóa khác"
                                            : "Chưa có sân nào trong hệ thống"}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {/* Header tạo sân */}
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Tạo sân mới
                                </h1>
                                <p className="text-gray-600">
                                    Thêm một sân mới vào hệ thống quản lý
                                </p>
                            </div>

                            {/* Form tạo sân */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                {/* Form Message */}
                                {formMessage && (
                                    <div
                                        className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                                            formMessage.type === "success"
                                                ? "bg-green-100 text-green-800 border border-green-200"
                                                : "bg-red-100 text-red-800 border border-red-200"
                                        }`}
                                    >
                                        {formMessage.type === "success" ? (
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
                                            {formMessage.text}
                                        </span>
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Thông tin cơ bản */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Thông tin cơ bản
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Tên sân *"
                                                placeholder="Ví dụ: Sân Cầu Lông ABC"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Loại sân *
                                                </label>
                                                <select
                                                    value={formData.sportTypes}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "sportTypes",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                    required
                                                >
                                                    <option value="Cầu lông">
                                                        Cầu lông
                                                    </option>
                                                    <option value="Pickleball">
                                                        Pickleball
                                                    </option>
                                                    <option value="Cả hai">
                                                        Cả hai
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Địa chỉ và mô tả */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Địa chỉ và mô tả
                                        </h3>
                                        <div className="space-y-4">
                                            <Input
                                                label="Địa chỉ *"
                                                placeholder="Ví dụ: 123 Nguyễn Văn Thoại, Ngũ Hành Sơn, Đà Nẵng"
                                                value={formData.address}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "address",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Mô tả
                                                </label>
                                                <textarea
                                                    placeholder="Mô tả về sân, tiện ích, đặc điểm nổi bật..."
                                                    value={formData.description}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thời gian hoạt động */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Thời gian hoạt động
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Giờ hoạt động"
                                                placeholder="Ví dụ: 6:00 - 22:00"
                                                value={formData.operatingHours}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "operatingHours",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="Vĩ độ (Latitude)"
                                                    type="number"
                                                    step="any"
                                                    placeholder="16.0471"
                                                    value={formData.latitude}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "latitude",
                                                            parseFloat(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                />
                                                <Input
                                                    label="Kinh độ (Longitude)"
                                                    type="number"
                                                    step="any"
                                                    placeholder="108.2068"
                                                    value={formData.longitude}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "longitude",
                                                            parseFloat(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin liên hệ */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Thông tin liên hệ
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Số điện thoại"
                                                placeholder="0901234567"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "phone",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <Input
                                                label="Email"
                                                type="email"
                                                placeholder="example@gmail.com"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Tiện ích */}
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Tiện ích
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Thêm tiện ích (Ví dụ: Điều hòa, Wifi, Đồ uống...)"
                                                    value={newAmenity}
                                                    onChange={(e) =>
                                                        setNewAmenity(
                                                            e.target.value
                                                        )
                                                    }
                                                    onKeyPress={(e) =>
                                                        e.key === "Enter" &&
                                                        addAmenity()
                                                    }
                                                    className="flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addAmenity}
                                                    variant="outline"
                                                    className="px-4"
                                                >
                                                    Thêm
                                                </Button>
                                            </div>

                                            {getAmenitiesArray().length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {getAmenitiesArray().map(
                                                        (amenity, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                                                            >
                                                                {amenity}
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        removeAmenity(
                                                                            amenity
                                                                        )
                                                                    }
                                                                    className="hover:text-red-600"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit buttons */}
                                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setActiveTab("manage")
                                            }
                                            disabled={creating}
                                        >
                                            Hủy bỏ
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-red-600 hover:bg-red-700 text-white px-8"
                                            disabled={creating}
                                        >
                                            {creating ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Đang tạo...
                                                </div>
                                            ) : (
                                                "Tạo sân mới"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
}
