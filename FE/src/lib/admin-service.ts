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

export interface DashboardStats {
    totalCourts: number;
    activeCourts: number;
    totalUsers: number;
    totalBookings: number;
    monthlyRevenue: number;
    popularSports: Array<{ name: string; count: number }>;
}

export class AdminService {
    /**
     * Lấy thống kê dashboard
     */
    async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
        try {
            return await apiClient.get<DashboardStats>(
                "/admin/dashboard/stats"
            );
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
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<Court>>(
                "/admin/courts",
                defaultParams
            );
        } catch (error) {
            console.error("Get all courts error:", error);
            throw error;
        }
    }

    /**
     * Tạo sân mới (admin)
     */
    async createCourt(
        courtData: CreateCourtRequest
    ): Promise<ApiResponse<Court>> {
        try {
            return await apiClient.post<Court>("/admin/courts", courtData);
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
            return await apiClient.post<User>("/admin/court-owners", ownerData);
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
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<User>>(
                "/admin/court-owners",
                defaultParams
            );
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
        params: {
            keyword?: string;
            role?: string;
            page?: number;
            size?: number;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<User>>> {
        try {
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<User>>(
                "/admin/users",
                defaultParams
            );
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
        status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
    ): Promise<ApiResponse<User>> {
        try {
            return await apiClient.put<User>(
                `/admin/users/${id}/status?status=${status}`
            );
        } catch (error) {
            console.error("Update user status error:", error);
            throw error;
        }
    }
}

// Export singleton instance
export const adminService = new AdminService();

// Export convenient functions
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
export const getAllUsers = (params?: {
    keyword?: string;
    role?: string;
    page?: number;
    size?: number;
}) => adminService.getAllUsers(params);
export const updateUserStatus = (
    id: number,
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
) => adminService.updateUserStatus(id, status);
