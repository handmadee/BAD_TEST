"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Navigation items - 5 chức năng chính
    const navItems = [
        {
            href: "/",
            label: "Trang chủ",
            isActive: pathname === "/",
        },
        {
            href: "/courts",
            label: "Danh sách sân",
            isActive: pathname === "/courts" || pathname.startsWith("/courts/"),
        },
        {
            href: "/create-team",
            label: "Tạo đội",
            isActive: pathname === "/create-team",
            requireAuth: true,
        },
        {
            href: "/my-bookings",
            label: "Quản lý đặt sân",
            isActive: pathname === "/my-bookings",
            requireAuth: true,
        },
        {
            href: "/messages",
            label: "Chat",
            isActive: pathname === "/messages",
            requireAuth: true,
        },
    ];

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        router.push("/");
    };

    const handleProfileClick = () => {
        setIsDropdownOpen(false);
        router.push("/profile");
    };

    return (
        <header className="bg-white shadow-lg border-b-2 border-red-100 sticky top-0 z-50">
            <div className="w-full px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo và Brand - To và rõ ràng */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/"
                            className="flex items-center space-x-4 hover:opacity-90 transition-opacity"
                        >
                            {/* Logo lớn hơn */}
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md">
                                <Image
                                    src="/logos/logo.jpg"
                                    alt="BadmintonApp Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Tên website to và đậm */}
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-red-600 leading-tight">
                                    BadmintonApp
                                </span>
                                <span className="text-sm text-gray-500 font-medium">
                                    Đặt sân cầu lông
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu - 5 chức năng chính trong 1 hàng */}
                    <nav className="flex items-center space-x-8">
                        {navItems.map((item) => {
                            // Hide auth-required items if not authenticated
                            if (item.requireAuth && !isAuthenticated) {
                                return null;
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200
                                        ${
                                            item.isActive
                                                ? "bg-red-600 text-white shadow-lg transform scale-105"
                                                : "text-gray-700 hover:bg-red-50 hover:text-red-600 hover:scale-105"
                                        }
                                    `}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Actions - Notification và Profile */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Notification - Only show when authenticated */}
                                <div className="relative">
                                    <button className="p-3 bg-gray-100 hover:bg-red-50 rounded-xl transition-colors group">
                                        <Bell className="w-6 h-6 text-gray-600 group-hover:text-red-600" />
                                        {/* Badge */}
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                                            3
                                        </span>
                                    </button>
                                </div>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() =>
                                            setIsDropdownOpen(!isDropdownOpen)
                                        }
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                                            {user?.avatarUrl ? (
                                                <Image
                                                    src={user.avatarUrl}
                                                    alt={
                                                        user.fullName || "User"
                                                    }
                                                    width={32}
                                                    height={32}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <User className="w-full h-full p-1 text-gray-500" />
                                            )}
                                        </div>
                                        <div className="hidden md:block">
                                            <span className="text-sm">
                                                {user?.fullName || "User"}
                                            </span>
                                        </div>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-700">
                                                    {user?.fullName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {user?.email}
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleProfileClick}
                                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>Hồ sơ cá nhân</span>
                                            </button>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Đăng xuất</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Login/Register buttons when not authenticated */
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/auth/signin"
                                    className="px-6 py-2.5 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-sm"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
