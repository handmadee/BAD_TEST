"use client";

import React, { useState } from "react";
import Image from "next/image";
import ImageGallery from "react-image-gallery";
import { TeamPost } from "@/lib/api";

interface TeamPostCardProps {
    post: TeamPost;
}

export function TeamPostCard({ post }: TeamPostCardProps) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [startIndex, setStartIndex] = useState(0);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
        });
    };

    // Chọn hình ảnh dựa trên ID post
    const getCourtImages = (postId: string) => {
        const images = [
            "/courts/court1.jpg",
            "/courts/court2.jpg",
            "/courts/court-placeholder.jpg",
        ];

        // Tạo gallery items cho react-image-gallery
        return images.map((src, index) => ({
            original: src,
            thumbnail: src,
            description: `Hình ảnh sân ${index + 1}`,
        }));
    };

    const handleImageClick = (imageIndex: number) => {
        setStartIndex(imageIndex);
        setIsGalleryOpen(true);
    };

    const galleryImages = getCourtImages(post.id);
    const mainImage = galleryImages[parseInt(post.id) % 3];

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex gap-8">
                    {/* Content - tăng kích thước font và spacing */}
                    <div className="flex-1">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xl text-gray-900 leading-relaxed">
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Môn thể thao:
                                    </span>
                                    <span
                                        className={`ml-2 px-4 py-2 rounded-2xl text-lg font-semibold ${
                                            post.sport === "Cầu lông"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                        {post.sport}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Trình độ:
                                    </span>
                                    <span
                                        className={`ml-2 px-4 py-2 rounded-2xl text-lg font-semibold ${
                                            post.skill_level === "Yếu"
                                                ? "bg-gray-100 text-gray-700"
                                                : post.skill_level ===
                                                  "Trung bình"
                                                ? "bg-blue-100 text-blue-700"
                                                : post.skill_level === "Khá"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : post.skill_level === "Giỏi"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-indigo-100 text-indigo-700"
                                        }`}
                                    >
                                        {post.skill_level}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-3 text-xl text-gray-900">
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Tên sân:
                                    </span>
                                    <span className="ml-2 text-gray-900">
                                        {post.court_name}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Địa điểm:
                                    </span>
                                    <span className="ml-2 text-gray-900">
                                        {post.court_address}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Thời gian:
                                    </span>
                                    <span className="ml-2 text-gray-900">
                                        {post.play_time} -{" "}
                                        {formatDate(post.date)}
                                    </span>
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-700">
                                        Cần tìm:
                                    </span>
                                    <span className="ml-2 px-4 py-2 bg-green-100 text-green-700 rounded-2xl text-lg font-bold">
                                        {post.needed_players -
                                            post.current_players}{" "}
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
                                    {post.content}
                                </p>
                            </div>
                        </div>

                        {/* Button lớn hơn */}
                        <button className="mt-8 w-full bg-red-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg">
                            Ghép đội ngay
                        </button>
                    </div>

                    {/* Images - có thể click để xem phóng to */}
                    <div className="flex-shrink-0">
                        <div className="space-y-4">
                            {/* Hình chính lớn hơn - clickable */}
                            <div
                                className="relative w-64 h-20 bg-gray-200 rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow group"
                                onClick={() =>
                                    handleImageClick(parseInt(post.id) % 3)
                                }
                            >
                                <Image
                                    src={mainImage.original}
                                    alt="Court main view"
                                    width={256}
                                    height={80}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                    <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                        Xem ảnh
                                    </span>
                                </div>
                            </div>

                            {/* Hình nhỏ bên dưới - clickable */}
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className="relative w-31 h-36 bg-gray-200 rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow group"
                                    onClick={() => handleImageClick(0)}
                                >
                                    <Image
                                        src="/courts/court1.jpg"
                                        alt="Court detail 1"
                                        width={124}
                                        height={144}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Xem
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="relative w-31 h-36 bg-gray-200 rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow group"
                                    onClick={() => handleImageClick(1)}
                                >
                                    <Image
                                        src="/courts/court2.jpg"
                                        alt="Court detail 2"
                                        width={124}
                                        height={144}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Xem
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông tin thêm */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-lg text-gray-500">
                        <span>
                            Đăng bởi:{" "}
                            <span className="font-semibold text-gray-700">
                                {post.author.name}
                            </span>
                        </span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                    </div>

                    <div className="text-lg text-gray-500">
                        <span>
                            Hiện có:{" "}
                            <span className="font-semibold text-blue-600">
                                {post.current_players}/{post.needed_players}
                            </span>{" "}
                            người
                        </span>
                    </div>
                </div>
            </div>

            {/* Image Gallery Modal */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
                    <div className="max-w-4xl max-h-full w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white text-xl font-semibold">
                                Hình ảnh sân: {post.court_name}
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
        </>
    );
}
