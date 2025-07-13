"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { teamService, authService } from "@/lib";
import type { CreateTeamPostRequest } from "@/types/api";
import { CustomSelect } from "@/components/ui";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CreateTeamPage() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        playDate: "",
        location: "",
        maxPlayers: 4,
        skillLevel: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Options for dropdowns
    const skillOptions = [
        { value: "", label: "Chọn trình độ..." },
        { value: "Yếu", label: "Yếu" },
        { value: "Trung bình", label: "Trung bình" },
        { value: "Khá", label: "Khá" },
        { value: "Giỏi", label: "Giỏi" },
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
        if (!formData.description.trim())
            newErrors.description = "Vui lòng nhập mô tả";
        if (!formData.playDate) newErrors.playDate = "Vui lòng chọn ngày chơi";
        if (!formData.location.trim())
            newErrors.location = "Vui lòng nhập địa điểm";
        if (formData.maxPlayers < 2)
            newErrors.maxPlayers = "Số người tối thiểu là 2";
        if (formData.maxPlayers > 20)
            newErrors.maxPlayers = "Số người tối đa là 20";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const teamPostData: CreateTeamPostRequest = {
                title: formData.title,
                description: formData.description,
                playDate: formData.playDate,
                location: formData.location,
                maxPlayers: formData.maxPlayers,
                skillLevel: formData.skillLevel || undefined,
            };

            await teamService.createTeamPost(teamPostData);
            setSuccess(true);

            // Reset form after 3 seconds
            setTimeout(() => {
                setFormData({
                    title: "",
                    description: "",
                    playDate: "",
                    location: "",
                    maxPlayers: 4,
                    skillLevel: "",
                });
                setErrors({});
                setSuccess(false);
            }, 3000);
        } catch (error: any) {
            console.error("Error creating team post:", error);
            setErrors({
                submit:
                    error?.response?.data?.message ||
                    "Có lỗi xảy ra khi tạo bài đăng",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "maxPlayers" ? parseInt(value) || 0 : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user selects
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // Get minimum date (today)
    const getMinDate = () => {
        return new Date().toISOString().split("T")[0];
    };

    if (success) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-lg w-full bg-white rounded-3xl shadow-lg p-12 text-center mx-4">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <div className="text-4xl text-green-600">✓</div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Tạo bài đăng thành công!
                        </h2>
                        <p className="text-lg text-gray-600 mb-8">
                            Bài đăng của bạn đã được tạo và sẽ hiển thị trên
                            trang chủ. Các thành viên khác có thể xem và tham
                            gia.
                        </p>
                        <div className="space-y-4">
                            <Link
                                href="/"
                                className="block bg-red-600 text-white px-8 py-4 rounded-2xl hover:bg-red-700 transition-colors text-lg font-bold"
                            >
                                Về trang chủ
                            </Link>
                            <button
                                onClick={() => setSuccess(false)}
                                className="block w-full border-2 border-red-600 text-red-600 px-8 py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-colors text-lg font-bold"
                            >
                                Tạo bài đăng khác
                            </button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Header />

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 lg:p-12">
                        {/* Header Section */}
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Tạo bài đăng tìm đội
                            </h1>
                            <p className="text-xl text-gray-600">
                                Tìm kiếm đồng đội để cùng chơi cầu lông hoặc
                                pickleball
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Global Error */}
                            {errors.submit && (
                                <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-700">
                                    {errors.submit}
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-lg font-bold text-gray-700 mb-3">
                                    Tiêu đề bài đăng{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="VD: Tìm 2 người chơi cầu lông tối nay"
                                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-0 transition-colors"
                                />
                                {errors.title && (
                                    <p className="mt-2 text-red-500 text-sm font-medium">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-lg font-bold text-gray-700 mb-3">
                                    Mô tả chi tiết{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Mô tả về buổi chơi, yêu cầu với đồng đội..."
                                    rows={4}
                                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-0 transition-colors resize-none"
                                />
                                {errors.description && (
                                    <p className="mt-2 text-red-500 text-sm font-medium">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-lg font-bold text-gray-700 mb-3">
                                        Ngày chơi{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="playDate"
                                        value={formData.playDate}
                                        onChange={handleChange}
                                        min={getMinDate()}
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-0 transition-colors"
                                    />
                                    {errors.playDate && (
                                        <p className="mt-2 text-red-500 text-sm font-medium">
                                            {errors.playDate}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <CustomSelect
                                        label="Trình độ yêu cầu"
                                        value={formData.skillLevel}
                                        onChange={(value) =>
                                            handleSelectChange(
                                                "skillLevel",
                                                value
                                            )
                                        }
                                        options={skillOptions}
                                    />
                                    {errors.skillLevel && (
                                        <p className="mt-2 text-red-500 text-sm font-medium">
                                            {errors.skillLevel}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Location and Players */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-lg font-bold text-gray-700 mb-3">
                                        Địa điểm{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="VD: Sân cầu lông ABC, Quận 1, TP.HCM"
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-0 transition-colors"
                                    />
                                    {errors.location && (
                                        <p className="mt-2 text-red-500 text-sm font-medium">
                                            {errors.location}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-lg font-bold text-gray-700 mb-3">
                                        Số người tối đa{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="maxPlayers"
                                        value={formData.maxPlayers}
                                        onChange={handleChange}
                                        min="2"
                                        max="20"
                                        className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-0 transition-colors"
                                    />
                                    {errors.maxPlayers && (
                                        <p className="mt-2 text-red-500 text-sm font-medium">
                                            {errors.maxPlayers}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500">
                                        Bao gồm cả bạn (tối thiểu 2, tối đa 20
                                        người)
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-8">
                                <Link
                                    href="/"
                                    className="flex-1 text-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                                >
                                    Hủy bỏ
                                </Link>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang tạo bài đăng...
                                        </div>
                                    ) : (
                                        "Tạo bài đăng"
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Tips Section */}
                        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                            <h3 className="text-lg font-bold text-blue-900 mb-4">
                                💡 Mẹo để có bài đăng hiệu quả
                            </h3>
                            <ul className="space-y-2 text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">
                                        •
                                    </span>
                                    <span>
                                        Viết tiêu đề rõ ràng, cụ thể về thời
                                        gian và địa điểm
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">
                                        •
                                    </span>
                                    <span>
                                        Mô tả chi tiết về trình độ và yêu cầu
                                        với đồng đội
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">
                                        •
                                    </span>
                                    <span>
                                        Cung cấp thông tin liên hệ để dễ dàng
                                        kết nối
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">
                                        •
                                    </span>
                                    <span>
                                        Đăng bài trước 2-3 ngày để có thời gian
                                        tìm đồng đội
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
