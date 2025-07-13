import { apiClient } from "./api-client";
import {
    Court,
    CreateCourtRequest,
    CourtSearchParams,
    PaginatedResponse,
    ApiResponse,
} from "@/types/api";

export class CourtService {
    /**
     * Lấy danh sách tất cả sân với phân trang
     */
    async getCourts(
        params: {
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
                "/courts",
                defaultParams
            );
        } catch (error) {
            console.error("Get courts error:", error);
            throw error;
        }
    }

    /**
     * Tìm kiếm sân với các bộ lọc
     */
    async searchCourts(
        params: CourtSearchParams
    ): Promise<ApiResponse<PaginatedResponse<Court>>> {
        try {
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<Court>>(
                "/courts/search",
                defaultParams
            );
        } catch (error) {
            console.error("Search courts error:", error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết của một sân
     */
    async getCourtById(id: number): Promise<ApiResponse<Court>> {
        try {
            return await apiClient.get<Court>(`/courts/${id}`);
        } catch (error) {
            console.error("Get court by id error:", error);
            throw error;
        }
    }

    /**
     * Tạo sân mới (chỉ dành cho COURT_OWNER)
     */
    async createCourt(
        courtData: CreateCourtRequest
    ): Promise<ApiResponse<Court>> {
        try {
            return await apiClient.post<Court>("/courts", courtData);
        } catch (error) {
            console.error("Create court error:", error);
            throw error;
        }
    }

    /**
     * Cập nhật thông tin sân
     */
    async updateCourt(
        id: number,
        courtData: Partial<CreateCourtRequest>
    ): Promise<ApiResponse<Court>> {
        try {
            return await apiClient.put<Court>(`/courts/${id}`, courtData);
        } catch (error) {
            console.error("Update court error:", error);
            throw error;
        }
    }

    /**
     * Xóa sân
     */
    async deleteCourt(id: number): Promise<ApiResponse<void>> {
        try {
            return await apiClient.delete<void>(`/courts/${id}`);
        } catch (error) {
            console.error("Delete court error:", error);
            throw error;
        }
    }

    /**
     * Tìm sân gần vị trí hiện tại
     */
    async getNearbyCourts(params: {
        latitude: number;
        longitude: number;
        radius?: number; // km
        page?: number;
        size?: number;
    }): Promise<ApiResponse<PaginatedResponse<Court>>> {
        try {
            const defaultParams = {
                radius: 10, // 10km mặc định
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<Court>>(
                "/courts/nearby",
                defaultParams
            );
        } catch (error) {
            console.error("Get nearby courts error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách sân của chủ sân hiện tại
     */
    async getMyCourts(
        params: {
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
                "/courts/my-courts",
                defaultParams
            );
        } catch (error) {
            console.error("Get my courts error:", error);
            throw error;
        }
    }

    /**
     * Cập nhật trạng thái sân
     */
    async updateCourtStatus(
        id: number,
        status: "ACTIVE" | "INACTIVE" | "MAINTENANCE"
    ): Promise<ApiResponse<Court>> {
        try {
            return await apiClient.patch<Court>(`/courts/${id}/status`, {
                status,
            });
        } catch (error) {
            console.error("Update court status error:", error);
            throw error;
        }
    }

    /**
     * Upload ảnh cho sân
     */
    async uploadCourtImages(
        id: number,
        images: File[]
    ): Promise<ApiResponse<string[]>> {
        try {
            const formData = new FormData();
            images.forEach((image, index) => {
                formData.append(`images`, image);
            });

            // Gọi API với FormData (không set Content-Type header)
            const response = await fetch(
                `${
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:8081/api"
                }/courts/${id}/images`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiClient.getToken()}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            return data;
        } catch (error) {
            console.error("Upload court images error:", error);
            throw error;
        }
    }

    /**
     * Lấy thống kê sân (cho dashboard)
     */
    async getCourtStats(
        id: number,
        params: {
            startDate?: string;
            endDate?: string;
        } = {}
    ): Promise<ApiResponse<any>> {
        try {
            return await apiClient.get<any>(`/courts/${id}/stats`, params);
        } catch (error) {
            console.error("Get court stats error:", error);
            throw error;
        }
    }
    /**
     * Lấy chi tiết sân (với pricing và reviews)
     */
    async getCourtDetails(courtId: string): Promise<ApiResponse<any>> {
        try {
            return await apiClient.get<any>(`/courts/${courtId}/details`);
        } catch (error) {
            console.error("Get court details error:", error);
            throw error;
        }
    }

    /**
     * Lấy bảng giá của sân
     */
    async getCourtPricing(courtId: string): Promise<ApiResponse<any>> {
        try {
            return await apiClient.get<any>(`/courts/${courtId}/pricing`);
        } catch (error) {
            console.error("Get court pricing error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách loại sân
     */
    async getCourtTypes(): Promise<ApiResponse<any[]>> {
        try {
            return await apiClient.get<any[]>("/courts/types");
        } catch (error) {
            console.error("Get court types error:", error);
            throw error;
        }
    }

    /**
     * Lấy thống kê dashboard
     */
    async getDashboardStats(): Promise<ApiResponse<any>> {
        try {
            return await apiClient.get<any>("/dashboard/stats");
        } catch (error) {
            console.error("Get dashboard stats error:", error);
            throw error;
        }
    }
}

// Singleton instance
export const courtService = new CourtService();

// Helper functions để sử dụng trực tiếp
export const getCourts = (params?: { page?: number; size?: number }) =>
    courtService.getCourts(params);

export const searchCourts = (params: CourtSearchParams) =>
    courtService.searchCourts(params);

export const getCourtById = (id: number) => courtService.getCourtById(id);

export const createCourt = (courtData: CreateCourtRequest) =>
    courtService.createCourt(courtData);
