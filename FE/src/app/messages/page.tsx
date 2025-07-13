"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

export default function MessagesPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header mới */}
            <Header />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px] flex items-center justify-center">
                    <div className="text-center max-w-md">
                        {/* Icon */}
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-10 h-10 text-gray-400"
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
                        </div>

                        {/* Content */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Tin nhắn
                        </h1>

                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Tính năng tin nhắn đang được phát triển. Bạn sẽ có
                            thể nhắn tin trực tiếp với những người chơi khác để
                            thảo luận về việc ghép đội và đặt lịch chơi.
                        </p>

                        {/* Features List */}
                        <div className="text-left space-y-3 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-3 h-3 text-red-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-gray-700">
                                    Chat trực tiếp với các thành viên
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-3 h-3 text-red-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-gray-700">
                                    Tạo nhóm chat cho từng đội
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-3 h-3 text-red-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-gray-700">
                                    Thông báo tin nhắn real-time
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-3 h-3 text-red-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <span className="text-gray-700">
                                    Chia sẻ vị trí sân và thông tin đặt chỗ
                                </span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/"
                                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors text-center"
                            >
                                Về trang chủ
                            </Link>

                            <Link
                                href="/create-team"
                                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                            >
                                Tạo bài đăng
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
