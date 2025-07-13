"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        staySignedIn: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            await login({
                email: formData.email,
                password: formData.password,
            });

            toast.success("Đăng nhập thành công!");
            router.push("/"); // Redirect về trang chủ
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error(
                error.message || "Đăng nhập thất bại. Vui lòng thử lại."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-md lg:max-w-lg backdrop-blur-sm border border-gray-200/50">
                {/* Title */}
                <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-8">
                    Đăng nhập
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full h-14 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                            placeholder="Nhập địa chỉ email"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Password field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full h-14 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                            placeholder="Nhập mật khẩu"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Stay signed in checkbox */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="staySignedIn"
                                checked={formData.staySignedIn}
                                onChange={handleChange}
                                className="mr-3 w-5 h-5"
                                disabled={isSubmitting}
                            />
                            <span className="text-sm text-gray-700">
                                Ghi nhớ đăng nhập
                            </span>
                        </label>

                        <Link
                            href="/auth/reset-password"
                            className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>

                    {/* Sign In Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 text-white text-base font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    >
                        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>

                    {/* OR Divider */}
                    <div className="flex items-center my-6">
                        <hr className="flex-1 border-gray-300" />
                        <span className="px-4 text-sm font-medium text-gray-500">
                            hoặc
                        </span>
                        <hr className="flex-1 border-gray-300" />
                    </div>

                    {/* Facebook Sign In */}
                    <button
                        type="button"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-white border-2 border-gray-300 text-gray-700 text-base font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50"
                    >
                        Đăng nhập với Facebook
                    </button>

                    {/* Register Link */}
                    <div className="text-center mt-6">
                        <span className="text-sm text-gray-600">
                            Chưa có tài khoản?{" "}
                        </span>
                        <Link
                            href="/auth/register"
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
