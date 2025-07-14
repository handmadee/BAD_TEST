"use client";

import React, { useState, useEffect } from "react";
import {
    adminService,
    type CreateCourtOwnerRequest,
    type DashboardStats,
} from "@/lib/admin-service";
import type { Court, CreateCourtRequest, User } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import ProtectedRoute from "@/components/ProtectedRoute";
import { geocodingService } from "@/lib/geocoding-service";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<
        "dashboard" | "courts" | "owners" | "users"
    >("dashboard");
    const [courts, setCourts] = useState<Court[]>([]);
    const [courtOwners, setCourtOwners] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Form states
    const [showCreateCourtForm, setShowCreateCourtForm] = useState(false);
    const [showCreateOwnerForm, setShowCreateOwnerForm] = useState(false);
    const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

    // Separate address fields
    const [addressForm, setAddressForm] = useState({
        street: "", // Số nhà, đường
        district: "", // Quận/huyện
        city: "", // Tỉnh/thành phố
    });

    const [createCourtForm, setCreateCourtForm] = useState<CreateCourtRequest>({
        name: "",
        address: "",
        description: "",
        phone: "",
        email: "",
        operatingHours: "",
        sportTypes: "",
        amenities: "",
        images: [],
        latitude: 10.762622, // Default to Ho Chi Minh City
        longitude: 106.660172,
    });
    const [createOwnerForm, setCreateOwnerForm] =
        useState<CreateCourtOwnerRequest>({
            username: "",
            fullName: "",
            email: "",
            phone: "",
            password: "",
            address: "",
            description: "",
        });

    // Geocoding function using backend API
    const geocodeAddress = async (fullAddress: string) => {
        try {
            setIsGeocodingLoading(true);

            const result = await geocodingService.geocodeAddress(fullAddress);

            setCreateCourtForm((prev) => ({
                ...prev,
                latitude: result.latitude,
                longitude: result.longitude,
            }));

            return result;
        } catch (error) {
            console.error("Geocoding error:", error);
            throw error; // Throw error to handle in submit function
        } finally {
            setIsGeocodingLoading(false);
        }
    };

    // Update full address when address parts change (no auto-geocoding)
    useEffect(() => {
        const { street, district, city } = addressForm;
        const addressParts = [street, district, city].filter((part) =>
            part.trim()
        );
        const fullAddress = addressParts.join(", ");

        setCreateCourtForm((prev) => ({
            ...prev,
            address: fullAddress,
        }));
    }, [addressForm]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        if (activeTab === "courts") {
            loadCourts();
        } else if (activeTab === "owners") {
            loadCourtOwners();
        } else if (activeTab === "users") {
            loadUsers();
        }
    }, [activeTab]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDashboardStats();
            setDashboardStats(response.data);
        } catch (error) {
            console.error("Failed to load dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCourts = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllCourts();
            setCourts(response.data.content || []);
        } catch (error) {
            console.error("Failed to load courts:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCourtOwners = async () => {
        try {
            setLoading(true);
            const response = await adminService.getCourtOwners();
            setCourtOwners(response.data.content || []);
        } catch (error) {
            console.error("Failed to load court owners:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllUsers();
            setUsers(response.data.content || []);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourt = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!createCourtForm.name || !createCourtForm.address) {
            alert("Vui lòng nhập tên sân và địa chỉ đầy đủ");
            return;
        }

        // Validate address components
        const { street, district, city } = addressForm;
        if (!street || !district || !city) {
            alert(
                "Vui lòng nhập đầy đủ: Tên đường, Quận/huyện, Tỉnh/thành phố"
            );
            return;
        }

        try {
            setLoading(true);

            // Perform geocoding on submit
            try {
                await geocodeAddress(createCourtForm.address);
            } catch (geocodingError: any) {
                alert(
                    `Không thể tìm tọa độ: ${
                        geocodingError.message || "Lỗi không xác định"
                    }. Vui lòng kiểm tra lại địa chỉ.`
                );
                setLoading(false);
                return;
            }

            // Validate coordinates after geocoding
            if (
                !createCourtForm.latitude ||
                !createCourtForm.longitude ||
                (createCourtForm.latitude === 10.762622 &&
                    createCourtForm.longitude === 106.660172)
            ) {
                alert(
                    "Không thể xác định tọa độ. Vui lòng kiểm tra lại địa chỉ."
                );
                return;
            }

            const response = await adminService.createCourt(createCourtForm);
            alert("Tạo sân mới thành công!");
            setShowCreateCourtForm(false);
            // Reset form
            setAddressForm({
                street: "",
                district: "",
                city: "",
            });
            setCreateCourtForm({
                name: "",
                address: "",
                description: "",
                phone: "",
                email: "",
                operatingHours: "",
                sportTypes: "",
                amenities: "",
                images: [],
                latitude: 10.762622,
                longitude: 106.660172,
            });
            // Reload courts list
            loadCourts();
        } catch (error: any) {
            console.error("Failed to create court:", error);
            alert(
                error.response?.data?.message || "Có lỗi xảy ra khi tạo sân mới"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOwner = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await adminService.createCourtOwner(
                createOwnerForm
            );
            alert("Tạo chủ sân mới thành công!");
            setShowCreateOwnerForm(false);
            // Reset form
            setCreateOwnerForm({
                username: "",
                fullName: "",
                email: "",
                phone: "",
                password: "",
                address: "",
                description: "",
            });
            // Reload owners list
            loadCourtOwners();
        } catch (error: any) {
            console.error("Failed to create court owner:", error);
            alert(
                error.response?.data?.message ||
                    "Có lỗi xảy ra khi tạo chủ sân mới"
            );
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : dashboardStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Tổng số sân
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {dashboardStats.totalCourts}
                        </p>
                        <p className="text-sm text-gray-600">
                            Hoạt động: {dashboardStats.activeCourts}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Người dùng
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            {dashboardStats.totalUsers}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Đặt sân
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {dashboardStats.totalBookings}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Doanh thu tháng
                        </h3>
                        <p className="text-3xl font-bold text-yellow-600">
                            {dashboardStats.monthlyRevenue.toLocaleString()}đ
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Môn thể thao phổ biến
                        </h3>
                        <div className="space-y-2">
                            {dashboardStats.popularSports.map(
                                (sport, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between"
                                    >
                                        <span className="text-gray-700">
                                            {sport.name}
                                        </span>
                                        <span className="font-semibold">
                                            {sport.count} sân
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-600">
                    Không thể tải dữ liệu dashboard
                </p>
            )}
        </div>
    );

    const renderCourts = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Quản lý sân
                </h2>
                <Button
                    onClick={() => setShowCreateCourtForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Tạo sân mới
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên sân
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Địa chỉ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Loại thể thao
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courts.map((court) => (
                                        <tr key={court.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {court.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {court.address}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {court.sportTypes}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        court.status ===
                                                        "ACTIVE"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {court.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900 mr-4">
                                                    Sửa
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderOwners = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Quản lý chủ sân
                </h2>
                <Button
                    onClick={() => setShowCreateOwnerForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Tạo chủ sân mới
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Điện thoại
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {courtOwners.map((owner) => (
                                        <tr key={owner.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {owner.fullName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {owner.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {owner.phone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        owner.status ===
                                                        "ACTIVE"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {owner.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    Cập nhật trạng thái
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
                Quản lý người dùng
            </h2>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vai trò
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hành động
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user.fullName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.role}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    Cập nhật trạng thái
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderCreateCourtModal = () => {
        if (!showCreateCourtForm) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Tạo sân mới</h3>
                        <button
                            onClick={() => setShowCreateCourtForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleCreateCourt} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên sân *
                            </label>
                            <Input
                                type="text"
                                value={createCourtForm.name}
                                onChange={(e) =>
                                    setCreateCourtForm({
                                        ...createCourtForm,
                                        name: e.target.value,
                                    })
                                }
                                required
                                placeholder="Nhập tên sân"
                            />
                        </div>

                        {/* Address Fields */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Địa chỉ *
                            </label>
                            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                💡 Chỉ cần nhập tên đường (không số nhà),
                                quận/huyện và thành phố để geocoding chính xác
                                nhất
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    value={addressForm.street}
                                    onChange={(e) =>
                                        setAddressForm({
                                            ...addressForm,
                                            street: e.target.value,
                                        })
                                    }
                                    placeholder="Tên đường (VD: Nguyễn Văn Linh, Lê Duẩn)"
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    value={addressForm.district}
                                    onChange={(e) =>
                                        setAddressForm({
                                            ...addressForm,
                                            district: e.target.value,
                                        })
                                    }
                                    placeholder="Quận/Huyện (VD: Thanh Khê, Quận 1)"
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) =>
                                        setAddressForm({
                                            ...addressForm,
                                            city: e.target.value,
                                        })
                                    }
                                    placeholder="Tỉnh/Thành phố (VD: Đà Nẵng, Hồ Chí Minh)"
                                    required
                                />
                            </div>

                            {/* Display full address */}
                            {createCourtForm.address && (
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <p className="text-sm text-gray-600">
                                        Địa chỉ đầy đủ:
                                    </p>
                                    <p className="text-sm font-medium">
                                        {createCourtForm.address}
                                    </p>
                                </div>
                            )}

                            {/* Display coordinates or geocoding status */}
                            {isGeocodingLoading ? (
                                <div className="p-3 bg-blue-50 rounded-md">
                                    <p className="text-sm text-blue-600">
                                        🔄 Đang tìm tọa độ...
                                    </p>
                                </div>
                            ) : createCourtForm.latitude !== 10.762622 ||
                              createCourtForm.longitude !== 106.660172 ? (
                                <div className="p-3 bg-green-50 rounded-md">
                                    <p className="text-sm text-green-600">
                                        ✓ Tọa độ:{" "}
                                        {createCourtForm.latitude?.toFixed(6)},{" "}
                                        {createCourtForm.longitude?.toFixed(6)}
                                    </p>
                                </div>
                            ) : createCourtForm.address ? (
                                <div className="p-3 bg-yellow-50 rounded-md">
                                    <p className="text-sm text-yellow-600">
                                        ⏳ Tọa độ sẽ được tự động tính toán khi
                                        bấm "Tạo sân"
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                value={createCourtForm.description}
                                onChange={(e) =>
                                    setCreateCourtForm({
                                        ...createCourtForm,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Nhập mô tả sân"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại
                                </label>
                                <Input
                                    type="tel"
                                    value={createCourtForm.phone}
                                    onChange={(e) =>
                                        setCreateCourtForm({
                                            ...createCourtForm,
                                            phone: e.target.value,
                                        })
                                    }
                                    placeholder="0123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={createCourtForm.email}
                                    onChange={(e) =>
                                        setCreateCourtForm({
                                            ...createCourtForm,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="contact@court.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giờ hoạt động
                            </label>
                            <Input
                                type="text"
                                value={createCourtForm.operatingHours}
                                onChange={(e) =>
                                    setCreateCourtForm({
                                        ...createCourtForm,
                                        operatingHours: e.target.value,
                                    })
                                }
                                placeholder="06:00 - 23:00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Loại thể thao
                            </label>
                            <Input
                                type="text"
                                value={createCourtForm.sportTypes}
                                onChange={(e) =>
                                    setCreateCourtForm({
                                        ...createCourtForm,
                                        sportTypes: e.target.value,
                                    })
                                }
                                placeholder="Cầu lông, Pickleball"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tiện ích
                            </label>
                            <Input
                                type="text"
                                value={createCourtForm.amenities}
                                onChange={(e) =>
                                    setCreateCourtForm({
                                        ...createCourtForm,
                                        amenities: e.target.value,
                                    })
                                }
                                placeholder="Điều hòa, Wifi, Thay đồ, Nước uống"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowCreateCourtForm(false)}
                                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || isGeocodingLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading
                                    ? "Đang tạo..."
                                    : isGeocodingLoading
                                    ? "Đang tìm tọa độ..."
                                    : "Tạo sân"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderCreateOwnerModal = () => {
        if (!showCreateOwnerForm) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Tạo chủ sân mới</h3>
                        <button
                            onClick={() => setShowCreateOwnerForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleCreateOwner} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên đăng nhập *
                            </label>
                            <Input
                                type="text"
                                value={createOwnerForm.username}
                                onChange={(e) =>
                                    setCreateOwnerForm({
                                        ...createOwnerForm,
                                        username: e.target.value,
                                    })
                                }
                                required
                                placeholder="courtowner1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên *
                            </label>
                            <Input
                                type="text"
                                value={createOwnerForm.fullName}
                                onChange={(e) =>
                                    setCreateOwnerForm({
                                        ...createOwnerForm,
                                        fullName: e.target.value,
                                    })
                                }
                                required
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <Input
                                type="email"
                                value={createOwnerForm.email}
                                onChange={(e) =>
                                    setCreateOwnerForm({
                                        ...createOwnerForm,
                                        email: e.target.value,
                                    })
                                }
                                required
                                placeholder="owner@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại *
                            </label>
                            <Input
                                type="tel"
                                value={createOwnerForm.phone}
                                onChange={(e) =>
                                    setCreateOwnerForm({
                                        ...createOwnerForm,
                                        phone: e.target.value,
                                    })
                                }
                                required
                                placeholder="0123456789"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu *
                            </label>
                            <Input
                                type="password"
                                value={createOwnerForm.password}
                                onChange={(e) =>
                                    setCreateOwnerForm({
                                        ...createOwnerForm,
                                        password: e.target.value,
                                    })
                                }
                                required
                                placeholder="Ít nhất 6 ký tự"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ
                            </label>
                            <Input
                                type="text"
                                value={createOwnerForm.address}
                                onChange={(e) =>
                                    setCreateOwnerForm({
                                        ...createOwnerForm,
                                        address: e.target.value,
                                    })
                                }
                                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                onClick={() => setShowCreateOwnerForm(false)}
                                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {loading ? "Đang tạo..." : "Tạo chủ sân"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <ProtectedRoute requiredRole="ADMIN">
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Admin Dashboard
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Quản lý hệ thống sân cầu lông
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Navigation Tabs */}
                    <div className="border-b border-gray-200 mb-8">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { key: "dashboard", label: "Dashboard" },
                                { key: "courts", label: "Quản lý sân" },
                                { key: "owners", label: "Chủ sân" },
                                { key: "users", label: "Người dùng" },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.key
                                            ? "border-red-500 text-red-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "dashboard" && renderDashboard()}
                    {activeTab === "courts" && renderCourts()}
                    {activeTab === "owners" && renderOwners()}
                    {activeTab === "users" && renderUsers()}
                </div>

                {/* Modals */}
                {renderCreateCourtModal()}
                {renderCreateOwnerModal()}
            </div>
        </ProtectedRoute>
    );
}
