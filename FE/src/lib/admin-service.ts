import { apiClient } from "./api-client";
import {
    Court,
    CreateCourtRequest,
    PaginatedResponse,
    ApiResponse,
    User,
} from "@/types/api";

export interface CreateCourtOwnerRequest {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    description?: string;
}

// Mock dashboard stats
const mockDashboardStats = {
    totalCourts: 25,
    activeCourts: 22,
    totalUsers: 150,
    totalBookings: 340,
    monthlyRevenue: 15000000,
    todayBookings: 12,
    weeklyRevenue: 3200000,
    popularSports: [
        { name: "Cầu lông", count: 18, percentage: 72 },
        { name: "Pickleball", count: 7, percentage: 28 },
    ],
    recentActivities: [
        {
            id: 1,
            type: "booking",
            message: "Nguyễn Văn A đã đặt sân ABC Sports",
            timestamp: "2024-01-15T10:30:00Z",
        },
        {
            id: 2,
            type: "registration",
            message: "Trần Thị B đã đăng ký tài khoản",
            timestamp: "2024-01-15T09:15:00Z",
        },
        {
            id: 3,
            type: "court_creation",
            message: "Sân Golden Court đã được thêm",
            timestamp: "2024-01-14T16:45:00Z",
        },
    ],
};

// Mock users data
const mockUsers: User[] = [
    {
        id: 1,
        email: "admin@badminton.com",
        fullName: "Administrator",
        phone: "0123456789",
        role: "ADMIN",
        status: "ACTIVE",
        avatarUrl: "/avatars/minhhoang.jpg",
        bio: "System Administrator",
        location: "Đà Nẵng",
        createdAt: "2024-01-01T00:00:00Z",
    },
    {
        id: 2,
        email: "owner1@example.com",
        fullName: "Nguyễn Văn Hoàng",
        phone: "0236123456",
        role: "COURT_OWNER",
        status: "ACTIVE",
        avatarUrl: "/avatars/minhhoang.jpg",
        bio: "Chủ sân ABC Sports",
        location: "Đà Nẵng",
        createdAt: "2024-01-02T10:30:00Z",
    },
    {
        id: 3,
        email: "user1@example.com",
        fullName: "Trần Thị Chi",
        phone: "0987654321",
        role: "USER",
        status: "ACTIVE",
        avatarUrl: "/avatars/thaochi.jpg",
        bio: "Yêu thích cầu lông",
        location: "Hồ Chí Minh",
        skillLevel: "Trung bình",
        preferredSports: ["Cầu lông", "Pickleball"],
        createdAt: "2024-01-03T14:20:00Z",
    },
    {
        id: 4,
        email: "user2@example.com",
        fullName: "Lê Minh Đức",
        phone: "0369852147",
        role: "USER",
        status: "ACTIVE",
        bio: "Tập luyện cầu lông hàng ngày",
        location: "Đà Nẵng",
        skillLevel: "Cao",
        preferredSports: ["Cầu lông"],
        createdAt: "2024-01-04T08:15:00Z",
    },
    {
        id: 5,
        email: "owner2@example.com",
        fullName: "Phạm Văn Nam",
        phone: "0258741963",
        role: "COURT_OWNER",
        status: "ACTIVE",
        bio: "Chủ sân Dragon Sports",
        location: "Đà Nẵng",
        createdAt: "2024-01-05T11:45:00Z",
    },
];

export class AdminService {
    /**
     * Lấy thống kê dashboard admin
     */
    async getDashboardStats(): Promise<ApiResponse<any>> {
        try {
            // Return mock data with delay to simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            const response: ApiResponse<any> = {
                success: true,
                message: "Lấy thống kê thành công",
                data: mockDashboardStats,
            };

            return response;
        } catch (error) {
            console.error("Get dashboard stats error:", error);
            throw error;
        }
    }

    // ================= COURT MANAGEMENT =================

    /**
     * Lấy danh sách tất cả sân (admin)
     */
    async getAllCourts(
        params: {
            keyword?: string;
            status?: string;
            page?: number;
            size?: number;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<Court>>> {
        try {
            // Import mock courts from court-service
            const { courtService } = await import("./court-service");
            return await courtService.getCourts({
                page: params.page,
                size: params.size,
            });
        } catch (error) {
            console.error("Get all courts error:", error);
            throw error;
        }
    }

    /**
     * Tạo sân mới (admin) - Temporary use public endpoint
     */
    async createCourt(
        courtData: CreateCourtRequest
    ): Promise<ApiResponse<Court>> {
        try {
            // Temporarily use public endpoint to avoid auth issues
            return await apiClient.post<Court>("/courts", courtData);
        } catch (error) {
            console.error("Create court error:", error);
            throw error;
        }
    }

    /**
     * Cập nhật sân (admin)
     */
    async updateCourt(
        id: number,
        courtData: Partial<CreateCourtRequest>
    ): Promise<ApiResponse<Court>> {
        try {
            return await apiClient.put<Court>(`/admin/courts/${id}`, courtData);
        } catch (error) {
            console.error("Update court error:", error);
            throw error;
        }
    }

    /**
     * Xóa sân (admin)
     */
    async deleteCourt(id: number): Promise<ApiResponse<void>> {
        try {
            return await apiClient.delete<void>(`/admin/courts/${id}`);
        } catch (error) {
            console.error("Delete court error:", error);
            throw error;
        }
    }

    // ================= COURT OWNER MANAGEMENT =================

    /**
     * Tạo tài khoản chủ sân (admin)
     */
    async createCourtOwner(
        ownerData: CreateCourtOwnerRequest
    ): Promise<ApiResponse<User>> {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const newOwner: User = {
                id: Date.now(),
                email: ownerData.email,
                fullName: ownerData.fullName,
                phone: ownerData.phone,
                role: "COURT_OWNER",
                status: "ACTIVE",
                bio: ownerData.description || "",
                location: ownerData.address || "",
                createdAt: new Date().toISOString(),
            };

            const response: ApiResponse<User> = {
                success: true,
                message: "Tạo chủ sân thành công",
                data: newOwner,
            };

            return response;
        } catch (error) {
            console.error("Create court owner error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách chủ sân (admin)
     */
    async getCourtOwners(
        params: {
            keyword?: string;
            page?: number;
            size?: number;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<User>>> {
        try {
            const { page = 0, size = 20, keyword } = params;

            let filteredOwners = mockUsers.filter(
                (user) => user.role === "COURT_OWNER"
            );

            // Filter by keyword
            if (keyword) {
                filteredOwners = filteredOwners.filter(
                    (user) =>
                        user.fullName
                            .toLowerCase()
                            .includes(keyword.toLowerCase()) ||
                        user.email.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            // Pagination
            const start = page * size;
            const end = start + size;
            const paginatedOwners = filteredOwners.slice(start, end);

            const response: ApiResponse<PaginatedResponse<User>> = {
                success: true,
                message: "Lấy danh sách chủ sân thành công",
                data: {
                    content: paginatedOwners,
                    totalElements: filteredOwners.length,
                    totalPages: Math.ceil(filteredOwners.length / size),
                    size: size,
                    number: page,
                    numberOfElements: paginatedOwners.length,
                    first: page === 0,
                    last: end >= filteredOwners.length,
                    empty: paginatedOwners.length === 0,
                },
            };

            return response;
        } catch (error) {
            console.error("Get court owners error:", error);
            throw error;
        }
    }

    // ================= USER MANAGEMENT =================

    /**
     * Lấy danh sách tất cả người dùng (admin)
     */
    async getAllUsers(
        keyword?: string,
        role?: string,
        page: number = 0,
        size: number = 20
    ): Promise<ApiResponse<PaginatedResponse<User>>> {
        try {
            let filteredUsers = [...mockUsers];

            // Filter by keyword
            if (keyword) {
                filteredUsers = filteredUsers.filter(
                    (user) =>
                        user.fullName
                            .toLowerCase()
                            .includes(keyword.toLowerCase()) ||
                        user.email.toLowerCase().includes(keyword.toLowerCase())
                );
            }

            // Filter by role
            if (role && role !== "ALL") {
                filteredUsers = filteredUsers.filter(
                    (user) => user.role === role
                );
            }

            // Pagination
            const start = page * size;
            const end = start + size;
            const paginatedUsers = filteredUsers.slice(start, end);

            const response: ApiResponse<PaginatedResponse<User>> = {
                success: true,
                message: "Lấy danh sách người dùng thành công",
                data: {
                    content: paginatedUsers,
                    totalElements: filteredUsers.length,
                    totalPages: Math.ceil(filteredUsers.length / size),
                    size: size,
                    number: page,
                    numberOfElements: paginatedUsers.length,
                    first: page === 0,
                    last: end >= filteredUsers.length,
                    empty: paginatedUsers.length === 0,
                },
            };

            return response;
        } catch (error) {
            console.error("Get all users error:", error);
            throw error;
        }
    }

    /**
     * Cập nhật trạng thái người dùng (admin)
     */
    async updateUserStatus(
        id: number,
        status: "ACTIVE" | "INACTIVE" | "BANNED"
    ): Promise<ApiResponse<User>> {
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            const user = mockUsers.find((u) => u.id === id);
            if (!user) {
                throw new Error(`Không tìm thấy người dùng với ID ${id}`);
            }

            user.status = status;

            const response: ApiResponse<User> = {
                success: true,
                message: "Cập nhật trạng thái thành công",
                data: user,
            };

            return response;
        } catch (error) {
            console.error("Update user status error:", error);
            throw error;
        }
    }
}

// Export instance và các helper functions
export const adminService = new AdminService();

export const getDashboardStats = () => adminService.getDashboardStats();

export const getAllCourts = (params?: {
    keyword?: string;
    status?: string;
    page?: number;
    size?: number;
}) => adminService.getAllCourts(params);

export const createCourt = (courtData: CreateCourtRequest) =>
    adminService.createCourt(courtData);

export const updateCourt = (
    id: number,
    courtData: Partial<CreateCourtRequest>
) => adminService.updateCourt(id, courtData);

export const deleteCourt = (id: number) => adminService.deleteCourt(id);

export const createCourtOwner = (ownerData: CreateCourtOwnerRequest) =>
    adminService.createCourtOwner(ownerData);

export const getCourtOwners = (params?: {
    keyword?: string;
    page?: number;
    size?: number;
}) => adminService.getCourtOwners(params);

export const getAllUsers = (
    keyword?: string,
    role?: string,
    page?: number,
    size?: number
) => adminService.getAllUsers(keyword, role, page, size);

export const updateUserStatus = (
    id: number,
    status: "ACTIVE" | "INACTIVE" | "BANNED"
) => adminService.updateUserStatus(id, status);
