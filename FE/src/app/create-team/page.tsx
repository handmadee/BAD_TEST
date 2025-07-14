"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { teamService, courtService } from "@/lib";
import {
    uploadService,
    validateImageFile,
    createPreviewUrl,
    revokePreviewUrl,
} from "@/lib/upload-service";
import type { CreateTeamPostRequest, Court } from "@/types/api";
import { CustomSelect } from "@/components/ui";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function CreateTeamPage() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        playDate: "",
        sport: "" as "Cầu lông" | "Pickleball" | "",
        maxPlayers: 4,
        skillLevel: "",
        images: [] as string[],
        // Địa điểm options
        locationMode: "custom" as "court" | "custom",
        selectedCourtId: "",
        customLocation: "",
        customAddress: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [courts, setCourts] = useState<Court[]>([]);
    const [loadingCourts, setLoadingCourts] = useState(false);

    // Options for dropdowns
    const sportOptions = [
        { value: "", label: "Chọn môn thể thao..." },
        { value: "BADMINTON", label: "Cầu lông" },
        { value: "PICKLEBALL", label: "Pickleball" },
    ];

    const skillOptions = [
        { value: "", label: "Chọn trình độ..." },
        { value: "WEAK", label: "Yếu" },
        { value: "AVERAGE", label: "Trung bình" },
        { value: "GOOD", label: "Khá" },
        { value: "EXCELLENT", label: "Giỏi" },
    ];

    const locationModeOptions = [
        { value: "custom", label: "Tự điền địa điểm" },
        { value: "court", label: "Chọn sân từ hệ thống" },
    ];

    // Load courts from API
    useEffect(() => {
        if (formData.locationMode === "court") {
            loadCourts();
        }
    }, [formData.locationMode]);

    const loadCourts = async () => {
        try {
            setLoadingCourts(true);
            const response = await courtService.getCourts({
                page: 0,
                size: 100,
            });
            setCourts(response.data.content || []);
        } catch (error) {
            console.error("Error loading courts:", error);
            toast.error("Không thể tải danh sách sân");
        } finally {
            setLoadingCourts(false);
        }
    };

    // Get court options for dropdown
    const courtOptions = [
        { value: "", label: "Chọn sân..." },
        ...courts.map((court) => ({
            value: court.id.toString(),
            label: `${court.name} - ${court.address}`,
        })),
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề";
        if (!formData.description.trim())
            newErrors.description = "Vui lòng nhập mô tả";
        if (!formData.playDate) newErrors.playDate = "Vui lòng chọn ngày chơi";
        if (!formData.sport) newErrors.sport = "Vui lòng chọn môn thể thao";

        // Validate location based on mode
        if (formData.locationMode === "court") {
            if (!formData.selectedCourtId) {
                newErrors.selectedCourtId = "Vui lòng chọn sân";
            }
        } else {
            if (!formData.customLocation.trim()) {
                newErrors.customLocation = "Vui lòng nhập tên địa điểm";
            }
            if (!formData.customAddress.trim()) {
                newErrors.customAddress = "Vui lòng nhập địa chỉ";
            }
        }

        if (formData.maxPlayers < 2)
            newErrors.maxPlayers = "Số người tối thiểu là 2";
        if (formData.maxPlayers > 20)
            newErrors.maxPlayers = "Số người tối đa là 20";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validate each file
        const validFiles: File[] = [];
        for (const file of files) {
            const validation = validateImageFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                toast.error(validation.error || "File không hợp lệ");
            }
        }

        // Limit to 3 images max
        if (selectedFiles.length + validFiles.length > 3) {
            toast.error("Tối đa 3 hình ảnh");
            return;
        }

        // Create preview URLs
        const newPreviewUrls = validFiles.map((file) => createPreviewUrl(file));

        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    };

    const removeImage = (index: number) => {
        const urlToRevoke = previewUrls[index];
        revokePreviewUrl(urlToRevoke);

        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

        // Also remove from uploaded images if exists
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const uploadImages = async (): Promise<string[]> => {
        if (selectedFiles.length === 0) return [];

        setUploadingImages(true);
        try {
            const uploadPromises = selectedFiles.map((file) =>
                uploadService.uploadImage(file, "post")
            );

            const responses = await Promise.all(uploadPromises);
            return responses.map((response) => response.data.fileUrl);
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Lỗi upload hình ảnh");
            return [];
        } finally {
            setUploadingImages(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Upload images first
            const imageUrls = await uploadImages();

            // Convert date to ISO string for backend
            const playDateTime = new Date(
                formData.playDate + "T12:00:00"
            ).toISOString();

            // Calculate final location based on mode
            let finalLocation = "";
            if (formData.locationMode === "court") {
                const selectedCourt = courts.find(
                    (court) => court.id.toString() === formData.selectedCourtId
                );
                finalLocation = selectedCourt
                    ? `${selectedCourt.name} - ${selectedCourt.address}`
                    : "";
            } else {
                finalLocation = `${formData.customLocation} - ${formData.customAddress}`;
            }

            const teamPostData: CreateTeamPostRequest = {
                title: formData.title,
                description: formData.description,
                playDate: playDateTime,
                location: finalLocation,
                maxPlayers: formData.maxPlayers,
                skillLevel: formData.skillLevel || undefined,
                sportType: formData.sport,
                images: imageUrls,
            };

            await teamService.createTeamPost(teamPostData);
            setSuccess(true);

            // Cleanup preview URLs
            previewUrls.forEach((url) => revokePreviewUrl(url));

            // Reset form after 3 seconds
            setTimeout(() => {
                setFormData({
                    title: "",
                    description: "",
                    playDate: "",
                    sport: "",
                    maxPlayers: 4,
                    skillLevel: "",
                    images: [],
                    locationMode: "custom",
                    selectedCourtId: "",
                    customLocation: "",
                    customAddress: "",
                });
                setSelectedFiles([]);
                setPreviewUrls([]);
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
                                    disabled={loading || uploadingImages}
                                />
                                {errors.description && (
                                    <p className="mt-2 text-red-500 text-sm font-medium">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Sport Selection */}
                            <div>
                                <label className="block text-lg font-bold text-gray-700 mb-3">
                                    Môn thể thao{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={formData.sport}
                                    onChange={(value) =>
                                        handleSelectChange("sport", value)
                                    }
                                    options={sportOptions}
                                    className="w-full"
                                />
                                {errors.sport && (
                                    <p className="mt-2 text-red-500 text-sm font-medium">
                                        {errors.sport}
                                    </p>
                                )}
                            </div>

                            {/* Location Mode */}
                            <div>
                                <label className="block text-lg font-bold text-gray-700 mb-3">
                                    Chọn cách nhập địa điểm{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    value={formData.locationMode}
                                    onChange={(value) =>
                                        handleSelectChange(
                                            "locationMode",
                                            value as "court" | "custom"
                                        )
                                    }
                                    options={locationModeOptions}
                                    className="w-full"
                                />
                            </div>

                            {/* Court Selection (when locationMode is "court") */}
                            {formData.locationMode === "court" && (
                                <div>
                                    <label className="block text-lg font-bold text-gray-700 mb-3">
                                        Chọn sân{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {loadingCourts ? (
                                        <div className="flex items-center justify-center py-4 text-gray-500">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-3"></div>
                                            Đang tải danh sách sân...
                                        </div>
                                    ) : (
                                        <CustomSelect
                                            value={formData.selectedCourtId}
                                            onChange={(value) =>
                                                handleSelectChange(
                                                    "selectedCourtId",
                                                    value
                                                )
                                            }
                                            options={courtOptions}
                                            className="w-full"
                                        />
                                    )}
                                    {errors.selectedCourtId && (
                                        <p className="mt-2 text-red-500 text-sm font-medium">
                                            {errors.selectedCourtId}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Custom Location (when locationMode is "custom") */}
                            {formData.locationMode === "custom" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-lg font-bold text-gray-700 mb-3">
                                            Tên địa điểm{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="customLocation"
                                            value={formData.customLocation}
                                            onChange={handleChange}
                                            placeholder="VD: Sân cầu lông ABC"
                                            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-0 transition-colors"
                                        />
                                        {errors.customLocation && (
                                            <p className="mt-2 text-red-500 text-sm font-medium">
                                                {errors.customLocation}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-lg font-bold text-gray-700 mb-3">
                                            Địa chỉ{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="customAddress"
                                            value={formData.customAddress}
                                            onChange={handleChange}
                                            placeholder="VD: 123 Nguyễn Văn Linh, Đà Nẵng"
                                            className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-red-500 focus:ring-0 transition-colors"
                                        />
                                        {errors.customAddress && (
                                            <p className="mt-2 text-red-500 text-sm font-medium">
                                                {errors.customAddress}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Image Upload */}
                            <div>
                                <label className="block text-lg font-bold text-gray-700 mb-3">
                                    Hình ảnh (tối đa 3 ảnh)
                                </label>

                                {/* File Input */}
                                <div className="mb-4">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={loading || uploadingImages}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="inline-flex items-center gap-3 px-6 py-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-red-500 transition-colors"
                                    >
                                        <svg
                                            className="w-6 h-6 text-gray-500"
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
                                        <span className="text-lg text-gray-600">
                                            Chọn hình ảnh
                                        </span>
                                    </label>
                                </div>

                                {/* Image Previews */}
                                {previewUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {previewUrls.map((url, index) => (
                                            <div
                                                key={index}
                                                className="relative group aspect-square"
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeImage(index)
                                                    }
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                                                    disabled={
                                                        loading ||
                                                        uploadingImages
                                                    }
                                                >
                                                    ×
                                                </button>
                                                {uploadingImages && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="mt-2 text-sm text-gray-500">
                                    Hỗ trợ JPG, PNG, GIF. Tối đa 10MB mỗi file.
                                </p>
                            </div>

                            {/* Date and Skill Level */}
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

                            {/* Players */}
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
                                    disabled={loading || uploadingImages}
                                    className="flex-1 px-8 py-4 bg-red-600 text-white text-lg font-bold rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploadingImages ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang upload hình ảnh...
                                        </div>
                                    ) : loading ? (
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
