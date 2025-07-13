"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function UnauthorizedPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 text-red-500 mb-6">
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Không có quyền truy cập
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        Bạn không có quyền truy cập vào trang này.
                    </p>
                    {user && (
                        <p className="text-sm text-gray-500 mb-8">
                            Tài khoản hiện tại:{" "}
                            <span className="font-medium">{user.fullName}</span>{" "}
                            ({user.role})
                        </p>
                    )}
                </div>

                <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Có thể bạn đang tìm:
                            </h2>
                        </div>

                        <div className="space-y-3">
                            <Link
                                href="/"
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                🏠 Về trang chủ
                            </Link>

                            <Link
                                href="/courts"
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                🏟️ Tìm sân cầu lông
                            </Link>

                            <Link
                                href="/create-team"
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                👥 Tạo bài tìm đối thủ
                            </Link>

                            <Link
                                href="/my-bookings"
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                📅 Lịch sử đặt sân
                            </Link>
                        </div>

                        <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản
                                trị viên.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
