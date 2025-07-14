"use client";

import React, { useState } from "react";
import Image from "next/image";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { TeamPost } from "@/types/api";
import { getFullImageUrl } from "@/utils";
import { sendMessageAndJoinRequest } from "@/lib/team-service";
import toast from "react-hot-toast";

interface TeamPostCardProps {
    post: TeamPost;
}

export function TeamPostCard({ post }: TeamPostCardProps) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [message, setMessage] = useState(
        "Xin chào! Mình muốn tham gia đội của bạn. "
    );
    const [loading, setLoading] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
        });
    };

    const formatPlayDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Lấy hình ảnh từ API hoặc dùng placeholder
    const getCourtImages = () => {
        if (post.images && post.images.length > 0) {
            return post.images.map((src, index) => ({
                original: getFullImageUrl(src),
                thumbnail: getFullImageUrl(src),
                description: `Hình ảnh ${index + 1}`,
            }));
        }

        // Fallback images nếu không có ảnh từ API
        const fallbackImages = [
            "/courts/court1.jpg",
            "/courts/court2.jpg",
            "/courts/court-placeholder.jpg",
        ];

        return fallbackImages.map((src, index) => ({
            original: src,
            thumbnail: src,
            description: `Hình ảnh sân ${index + 1}`,
        }));
    };

    const handleImageClick = (imageIndex: number) => {
        setStartIndex(imageIndex);
        setIsGalleryOpen(true);
    };

    const handleSendMessageAndJoin = async () => {
        if (!message.trim()) {
            toast.error("Vui lòng nhập tin nhắn");
            return;
        }

        setLoading(true);
        try {
            await sendMessageAndJoinRequest(post.id, message.trim());
            toast.success("Đã gửi tin nhắn và yêu cầu tham gia đội!");
            setIsChatModalOpen(false);
        } catch (error: any) {
            console.error("Error sending message and join request:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    const galleryImages = getCourtImages();

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex gap-8">
                    {/* Content */}
                    <div className="flex-1">
                        <div className="space-y-4">
                            {/* Title */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {post.title}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xl text-gray-900 leading-relaxed">
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Môn thể thao:
                                    </span>
                                    <span
                                        className={`ml-2 px-4 py-2 rounded-2xl text-lg font-semibold ${
                                            post.sportType === "BADMINTON"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                        {post.sportType === "BADMINTON"
                                            ? "Cầu lông"
                                            : "Pickleball"}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Trình độ:
                                    </span>
                                    <span
                                        className={`ml-2 px-4 py-2 rounded-2xl text-lg font-semibold ${
                                            post.skillLevel === "WEAK"
                                                ? "bg-gray-100 text-gray-700"
                                                : post.skillLevel === "AVERAGE"
                                                ? "bg-blue-100 text-blue-700"
                                                : post.skillLevel === "GOOD"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : post.skillLevel ===
                                                  "EXCELLENT"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-indigo-100 text-indigo-700"
                                        }`}
                                    >
                                        {post.skillLevel === "WEAK"
                                            ? "Yếu"
                                            : post.skillLevel === "AVERAGE"
                                            ? "Trung bình"
                                            : post.skillLevel === "GOOD"
                                            ? "Khá"
                                            : post.skillLevel === "EXCELLENT"
                                            ? "Giỏi"
                                            : "Không xác định"}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-3 text-xl text-gray-900">
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Địa điểm:
                                    </span>
                                    <span className="ml-2 text-gray-900">
                                        {post.location}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Thời gian:
                                    </span>
                                    <span className="ml-2 text-gray-900">
                                        {formatPlayDate(post.playDate)}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Cần tìm:
                                    </span>
                                    <span className="ml-2 px-4 py-2 bg-green-100 text-green-700 rounded-2xl text-lg font-bold">
                                        {post.availableSlots ||
                                            post.maxPlayers -
                                                post.currentPlayers}{" "}
                                        người
                                    </span>
                                </p>
                            </div>

                            {/* Nội dung bài đăng */}
                            <div className="bg-gray-50 rounded-xl p-6 mt-6">
                                <p className="font-semibold text-gray-700 text-xl mb-2">
                                    Nội dung:
                                </p>
                                <p className="text-xl text-gray-800 leading-relaxed">
                                    {post.description}
                                </p>
                            </div>
                        </div>

                        {/* Button sẽ được hiển thị trong modal */}
                    </div>

                    {/* Images - có thể click để xem phóng to */}
                    <div className="flex-shrink-0">
                        <div className="space-y-4">
                            {/* Hình chính lớn hơn - clickable */}
                            <div
                                className="relative w-64 h-40 bg-gray-200 rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow group"
                                onClick={() => handleImageClick(0)}
                            >
                                <Image
                                    src={galleryImages[0].original}
                                    alt="Hình ảnh chính"
                                    width={256}
                                    height={160}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                        console.error(
                                            "Image load error:",
                                            galleryImages[0].original
                                        );
                                        e.currentTarget.src =
                                            "/courts/court-placeholder.jpg";
                                    }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Xem ảnh
                                    </span>
                                </div>
                            </div>

                            {/* Hình nhỏ bên dưới - clickable */}
                            {galleryImages.length > 1 && (
                                <div className="grid grid-cols-2 gap-3">
                                    {galleryImages
                                        .slice(1, 3)
                                        .map((image, index) => (
                                            <div
                                                key={index}
                                                className="relative w-31 h-24 bg-gray-200 rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow group"
                                                onClick={() =>
                                                    handleImageClick(index + 1)
                                                }
                                            >
                                                <Image
                                                    src={image.original}
                                                    alt={`Hình ảnh ${
                                                        index + 2
                                                    }`}
                                                    width={124}
                                                    height={96}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        console.error(
                                                            "Image load error:",
                                                            image.original
                                                        );
                                                        e.currentTarget.src =
                                                            "/courts/court-placeholder.jpg";
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                                    <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Xem
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Thông tin thêm */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-lg text-gray-500">
                            <span>
                                Đăng bởi:{" "}
                                <span className="font-semibold text-gray-700">
                                    {post.user?.fullName || "Ẩn danh"}
                                </span>
                            </span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                        </div>

                        <div className="text-lg text-gray-500">
                            <span>
                                Hiện có:{" "}
                                <span className="font-semibold text-blue-600">
                                    {post.currentPlayers}
                                </span>
                                /{" "}
                                <span className="font-semibold text-gray-700">
                                    {post.maxPlayers}
                                </span>{" "}
                                người
                            </span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {post.canJoin && !post.isFull && (
                            <button
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                                onClick={() => setIsChatModalOpen(true)}
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
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                Nhắn tin & Xin ghép đội
                            </button>
                        )}

                        {post.isFull && (
                            <div className="flex-1 bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-semibold text-center">
                                Đội đã đầy
                            </div>
                        )}

                        {!post.canJoin && !post.isFull && (
                            <div className="flex-1 bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-semibold text-center">
                                Đã tham gia
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Gallery Modal */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
                    <div className="max-w-4xl max-h-full w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white text-xl font-semibold">
                                Hình ảnh: {post.title}
                            </h3>
                            <button
                                onClick={() => setIsGalleryOpen(false)}
                                className="text-white hover:text-red-500 text-3xl font-bold transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        <ImageGallery
                            items={galleryImages}
                            startIndex={startIndex}
                            showThumbnails={true}
                            showFullscreenButton={true}
                            showPlayButton={false}
                            showBullets={true}
                            autoPlay={false}
                            slideDuration={300}
                            slideInterval={3000}
                        />
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {isChatModalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Nhắn tin với chủ đội
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {post.user?.fullName || "Ẩn danh"} •{" "}
                                    {post.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsChatModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Message Form */}
                        <div className="p-6 flex-1">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tin nhắn giới thiệu
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                        rows={4}
                                        placeholder="Xin chào! Mình muốn tham gia đội của bạn. Mình có kinh nghiệm chơi..."
                                        value={message}
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        disabled={loading}
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <svg
                                            className="w-5 h-5 text-yellow-600 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-yellow-800">
                                                Lưu ý quan trọng
                                            </p>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Sau khi gửi tin nhắn, chủ đội sẽ
                                                xem xét và phản hồi. Nếu đồng ý,
                                                bạn sẽ được chấp nhận vào đội.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t flex gap-3">
                            <button
                                onClick={() => setIsChatModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Hủy
                            </button>
                            <button
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleSendMessageAndJoin}
                                disabled={loading}
                            >
                                {loading ? "Đang gửi..." : "Gửi & Xin tham gia"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
