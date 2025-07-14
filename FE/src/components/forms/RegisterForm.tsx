"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterForm() {
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Validation
        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        if (!formData.agreeToTerms) {
            toast.error("Bạn cần đồng ý với điều khoản sử dụng!");
            return;
        }

        try {
            setIsSubmitting(true);
            await register({
                username: formData.username,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });

            toast.success("Đăng ký thành công!");
            router.push("/"); // Redirect về trang chủ
        } catch (error: any) {
            console.error("Register error:", error);
            toast.error(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-2xl backdrop-blur-sm border border-gray-200/50">
                {/* Title */}
                <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent mb-8">
                    Đăng ký tài khoản
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                            placeholder="Nhập tên đăng nhập (chỉ chữ, số và _)"
                            pattern="^[a-zA-Z0-9_]+$"
                            minLength={3}
                            maxLength={50}
                            required
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Từ 3-50 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới
                        </p>
                    </div>

                    {/* Full Name field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                            placeholder="Nhập họ và tên"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

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
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                            placeholder="Nhập địa chỉ email"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Phone field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                            placeholder="Nhập số điện thoại"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Date of Birth and Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày sinh
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giới tính
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                    </div>

                    {/* Password fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                                placeholder="Tối thiểu 6 ký tự"
                                required
                                disabled={isSubmitting}
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200"
                                placeholder="Nhập lại mật khẩu"
                                required
                                disabled={isSubmitting}
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="mt-1 mr-3 w-5 h-5"
                            disabled={isSubmitting}
                            required
                        />
                        <span className="text-sm text-gray-700">
                            Tôi đồng ý với{" "}
                            <Link
                                href="/terms"
                                className="text-red-600 hover:text-red-700 hover:underline transition-colors"
                            >
                                điều khoản sử dụng
                            </Link>{" "}
                            và{" "}
                            <Link
                                href="/privacy"
                                className="text-red-600 hover:text-red-700 hover:underline transition-colors"
                            >
                                chính sách bảo mật
                            </Link>
                        </span>
                    </div>

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-gradient-to-r from-red-600 to-red-500 text-white text-base font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                    >
                        {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                    </button>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                        <span className="text-sm text-gray-600">
                            Đã có tài khoản?{" "}
                        </span>
                        <Link
                            href="/auth/signin"
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
                        >
                            Đăng nhập ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
