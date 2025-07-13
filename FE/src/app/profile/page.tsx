"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/lib";
import type { User } from "@/types/api";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    User as UserIcon,
    Mail,
    Phone,
    Calendar,
    MapPin,
    TrendingUp,
    Edit3,
    Save,
    X,
    Upload,
    Users,
    Activity,
    Award,
    Settings,
    CheckCircle,
    XCircle,
} from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const response = await authService.getCurrentUser();
            const currentUser = response.data;
            setUser(currentUser);
            setEditData({
                fullName: currentUser.fullName,
                email: currentUser.email,
                phone: currentUser.phone || "",
                gender: currentUser.gender || "",
                dateOfBirth: currentUser.dateOfBirth || "",
                skillLevel: currentUser.skillLevel || "",
                preferredSports: currentUser.preferredSports || [],
                bio: currentUser.bio || "",
                location: currentUser.location || "",
            });
        } catch (error) {
            console.error("Lỗi khi tải thông tin profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setSaveMessage(null);

        try {
            // Validate required fields
            if (!editData.fullName.trim()) {
                throw new Error("Tên không được để trống");
            }

            if (!editData.email.trim()) {
                throw new Error("Email không được để trống");
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(editData.email)) {
                throw new Error("Email không đúng định dạng");
            }

            // Gọi API để cập nhật thông tin
            const response = await authService.updateProfile(editData);
            const updatedUser = response.data;

            // Cập nhật local state với data từ server
            setUser(updatedUser);
            setIsEditing(false);
            setSaveMessage({
                type: "success",
                text: "Cập nhật thông tin thành công!",
            });

            // Clear success message after 3 seconds
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error("Lỗi khi cập nhật profile:", error);
            setSaveMessage({
                type: "error",
                text:
                    error instanceof Error
                        ? error.message
                        : "Có lỗi xảy ra khi cập nhật thông tin",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setEditData({
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || "",
                gender: user.gender || "",
                dateOfBirth: user.dateOfBirth || "",
                skillLevel: user.skillLevel || "",
                preferredSports: user.preferredSports || [],
                bio: user.bio || "",
                location: user.location || "",
            });
        }
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Chưa cập nhật";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleAvatarUpload = async (file: File) => {
        if (!user) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setSaveMessage({
                type: "error",
                text: "Vui lòng chọn file ảnh (JPG, PNG, GIF, etc.)",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setSaveMessage({
                type: "error",
                text: "Kích thước ảnh không được vượt quá 5MB",
            });
            return;
        }

        setUploadingAvatar(true);
        setSaveMessage(null);

        try {
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);

            // In real app, you would upload to cloud storage (AWS S3, Cloudinary, etc.)
            // For demo, we'll simulate upload and use a mock URL
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate upload

            // Mock uploaded URL (in real app this would be returned from upload service)
            const uploadedUrl = `/avatars/uploaded-${Date.now()}.jpg`;

            // Update user profile with new avatar
            const response = await authService.updateProfile({
                avatarUrl: uploadedUrl,
            });
            const updatedUser = response.data;

            setUser(updatedUser);
            setSaveMessage({
                type: "success",
                text: "Cập nhật avatar thành công!",
            });

            // Clear preview
            URL.revokeObjectURL(previewUrl);
            setAvatarPreview(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error("Lỗi khi upload avatar:", error);
            setSaveMessage({
                type: "error",
                text: "Có lỗi xảy ra khi upload avatar",
            });

            // Clear preview on error
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
            }
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleAvatarClick = () => {
        if (!isEditing || uploadingAvatar) return;
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                handleAvatarUpload(file);
            }
        };
        fileInput.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isEditing || uploadingAvatar) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("image/")) {
                handleAvatarUpload(file);
            } else {
                setSaveMessage({
                    type: "error",
                    text: "Vui lòng chọn file ảnh",
                });
            }
        }
    };

    const getSkillLevelColor = (level: string) => {
        switch (level) {
            case "Yếu":
                return "bg-gray-100 text-gray-800";
            case "Trung bình":
                return "bg-blue-100 text-blue-800";
            case "Khá":
                return "bg-green-100 text-green-800";
            case "Giỏi":
                return "bg-purple-100 text-purple-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getGenderDisplay = (gender: string) => {
        switch (gender) {
            case "MALE":
                return "Nam";
            case "FEMALE":
                return "Nữ";
            case "OTHER":
                return "Khác";
            default:
                return "Chưa cập nhật";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <p className="text-gray-600">
                            Không thể tải thông tin profile
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Header />

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-red-600 mb-4">
                            Hồ sơ cá nhân
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Quản lý thông tin cá nhân và tùy chỉnh tài khoản của
                            bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Avatar & Basic Info */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                {/* Avatar Section */}
                                <div className="text-center mb-6">
                                    <div className="relative inline-block">
                                        <div
                                            className={`w-32 h-32 rounded-full overflow-hidden border-4 mx-auto relative transition-all ${
                                                isEditing
                                                    ? "border-red-300 cursor-pointer hover:border-red-400 hover:shadow-lg"
                                                    : "border-gray-200"
                                            } ${
                                                uploadingAvatar
                                                    ? "opacity-50"
                                                    : ""
                                            }`}
                                            onClick={handleAvatarClick}
                                            onDragOver={handleDragOver}
                                            onDragEnter={handleDragEnter}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            title={
                                                isEditing
                                                    ? "Click hoặc kéo thả ảnh để thay đổi avatar"
                                                    : ""
                                            }
                                        >
                                            <Image
                                                src={
                                                    avatarPreview ||
                                                    user.avatarUrl ||
                                                    "/avatars/default.jpg"
                                                }
                                                alt={user.fullName}
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Upload Loading Overlay */}
                                            {uploadingAvatar && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                        <span className="text-white text-xs font-medium">
                                                            Đang tải...
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hover Overlay for Edit Mode */}
                                            {isEditing && !uploadingAvatar && (
                                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200">
                                                    <div className="text-center">
                                                        <Upload className="w-6 h-6 text-white mx-auto mb-1" />
                                                        <span className="text-white text-xs font-medium">
                                                            Thay đổi
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Upload Button - Alternative */}
                                        {isEditing && !uploadingAvatar && (
                                            <button
                                                onClick={handleAvatarClick}
                                                className="absolute bottom-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                                            >
                                                <Upload className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                                        {user.fullName}
                                    </h2>

                                    {/* Avatar Upload Instructions */}
                                    {isEditing && !uploadingAvatar && (
                                        <p className="text-sm text-gray-500 mb-3">
                                            Click hoặc kéo thả ảnh để thay đổi
                                            avatar
                                            <br />
                                            <span className="text-xs">
                                                Hỗ trợ JPG, PNG, GIF • Tối đa
                                                5MB
                                            </span>
                                        </p>
                                    )}

                                    <div
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(
                                            user.skillLevel || ""
                                        )}`}
                                    >
                                        <Award className="w-4 h-4 mr-2" />
                                        {user.skillLevel || "Chưa cập nhật"}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                            <Activity className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            12
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Lần đặt sân
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                            <Users className="w-6 h-6 text-green-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            8
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Bài đăng
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                            <TrendingUp className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            4.8
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Đánh giá
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Chỉnh sửa hồ sơ
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {saving ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                {saving ? "Đang lưu..." : "Lưu"}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <X className="w-4 h-4" />
                                                Hủy
                                            </button>
                                        </div>
                                    )}

                                    <Link
                                        href="/my-bookings"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                    >
                                        <Activity className="w-4 h-4" />
                                        Xem lịch sử đặt sân
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Detailed Info */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Thông tin chi tiết
                                    </h3>
                                    {isEditing && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600">
                                            <Settings className="w-4 h-4" />
                                            Chế độ chỉnh sửa
                                        </div>
                                    )}
                                </div>

                                {/* Save Message */}
                                {saveMessage && (
                                    <div
                                        className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                                            saveMessage.type === "success"
                                                ? "bg-green-100 text-green-800 border border-green-200"
                                                : "bg-red-100 text-red-800 border border-red-200"
                                        }`}
                                    >
                                        {saveMessage.type === "success" ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            <XCircle className="w-5 h-5" />
                                        )}
                                        <span className="font-medium">
                                            {saveMessage.text}
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tên */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Họ và tên
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.fullName}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        fullName:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <UserIcon className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-900">
                                                    {user.fullName}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        email: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Mail className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-900">
                                                    {user.email}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Số điện thoại */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editData.phone}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        phone: e.target.value,
                                                    })
                                                }
                                                placeholder="Nhập số điện thoại"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Phone className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-900">
                                                    {user.phone ||
                                                        "Chưa cập nhật"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Giới tính */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Giới tính
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={editData.gender}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        gender: e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            >
                                                <option value="">
                                                    Chọn giới tính
                                                </option>
                                                <option value="MALE">
                                                    Nam
                                                </option>
                                                <option value="FEMALE">
                                                    Nữ
                                                </option>
                                                <option value="OTHER">
                                                    Khác
                                                </option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <UserIcon className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-900">
                                                    {getGenderDisplay(
                                                        user.gender || ""
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Ngày sinh */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày sinh
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={editData.dateOfBirth}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        dateOfBirth:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Calendar className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-900">
                                                    {formatDate(
                                                        user.dateOfBirth || ""
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Trình độ */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Trình độ chơi
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={editData.skillLevel}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        skillLevel:
                                                            e.target.value,
                                                    })
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            >
                                                <option value="">
                                                    Chọn trình độ
                                                </option>
                                                <option value="Yếu">Yếu</option>
                                                <option value="Trung bình">
                                                    Trung bình
                                                </option>
                                                <option value="Khá">Khá</option>
                                                <option value="Giỏi">
                                                    Giỏi
                                                </option>
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Award className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-900">
                                                    {user.skillLevel ||
                                                        "Chưa cập nhật"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vị trí */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Khu vực
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.location}
                                                onChange={(e) =>
                                                    setEditData({
                                                        ...editData,
                                                        location:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="VD: Đà Nẵng, Hải Châu"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <MapPin className="w-5 h-5 text-gray-500" />
                                                <span className="text-gray-900">
                                                    {user.location ||
                                                        "Chưa cập nhật"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Môn thể thao yêu thích */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Môn thể thao yêu thích
                                    </label>
                                    {isEditing ? (
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={editData.preferredSports?.includes(
                                                        "Cầu lông"
                                                    )}
                                                    onChange={(e) => {
                                                        const sports =
                                                            editData.preferredSports ||
                                                            [];
                                                        if (e.target.checked) {
                                                            setEditData({
                                                                ...editData,
                                                                preferredSports:
                                                                    [
                                                                        ...sports,
                                                                        "Cầu lông",
                                                                    ],
                                                            });
                                                        } else {
                                                            setEditData({
                                                                ...editData,
                                                                preferredSports:
                                                                    sports.filter(
                                                                        (
                                                                            s: string
                                                                        ) =>
                                                                            s !==
                                                                            "Cầu lông"
                                                                    ),
                                                            });
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                />
                                                <span className="ml-2">
                                                    Cầu lông
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={editData.preferredSports?.includes(
                                                        "Pickleball"
                                                    )}
                                                    onChange={(e) => {
                                                        const sports =
                                                            editData.preferredSports ||
                                                            [];
                                                        if (e.target.checked) {
                                                            setEditData({
                                                                ...editData,
                                                                preferredSports:
                                                                    [
                                                                        ...sports,
                                                                        "Pickleball",
                                                                    ],
                                                            });
                                                        } else {
                                                            setEditData({
                                                                ...editData,
                                                                preferredSports:
                                                                    sports.filter(
                                                                        (
                                                                            s: string
                                                                        ) =>
                                                                            s !==
                                                                            "Pickleball"
                                                                    ),
                                                            });
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                />
                                                <span className="ml-2">
                                                    Pickleball
                                                </span>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            {user.preferredSports &&
                                            user.preferredSports.length > 0 ? (
                                                user.preferredSports.map(
                                                    (sport) => (
                                                        <span
                                                            key={sport}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                                                        >
                                                            <TrendingUp className="w-4 h-4 mr-2" />
                                                            {sport}
                                                        </span>
                                                    )
                                                )
                                            ) : (
                                                <span className="text-gray-500">
                                                    Chưa chọn môn thể thao
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Giới thiệu bản thân */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Giới thiệu bản thân
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.bio}
                                            onChange={(e) =>
                                                setEditData({
                                                    ...editData,
                                                    bio: e.target.value,
                                                })
                                            }
                                            placeholder="Viết vài dòng giới thiệu về bản thân..."
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                        />
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-gray-900">
                                                {user.bio ||
                                                    "Chưa có thông tin giới thiệu"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Thao tác nhanh
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link
                                href="/courts"
                                className="group bg-red-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-red-700 transition-all text-center transform hover:scale-105"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Calendar className="w-5 h-5" />
                                    Đặt sân mới
                                </div>
                            </Link>

                            <Link
                                href="/create-team"
                                className="group bg-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all text-center transform hover:scale-105"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <Users className="w-5 h-5" />
                                    Tạo bài tìm đội
                                </div>
                            </Link>

                            <Link
                                href="/"
                                className="group border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-bold hover:bg-gray-50 transition-all text-center transform hover:scale-105"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <TrendingUp className="w-5 h-5" />
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
