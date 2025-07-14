import { apiClient } from "./api-client";
import {
    Court,
    CreateCourtRequest,
    CourtSearchParams,
    PaginatedResponse,
    ApiResponse,
} from "@/types/api";

// Mock data cho 4 courts với pricing schedule
const MOCK_COURTS: Court[] = [
    {
        id: 1,
        name: "Sân Cầu Lông Đà Nẵng Center",
        address: "123 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng",
        description:
            "Sân cầu lông hiện đại với 8 sân thi đấu, ánh sáng LED chuyên nghiệp, sàn gỗ cao cấp. Có điều hòa, phòng thay đồ sạch sẽ, bãi đỗ xe rộng rãi.",
        phone: "0236.3883.999",
        email: "contact@danangcenter.com",
        operatingHours: "05:00 - 23:00",
        sportTypes: "Cầu lông",
        amenities:
            "Điều hòa, Phòng thay đồ, Bãi đỗ xe, Căn tin, Wifi miễn phí, Thuê vợt",
        latitude: 16.0544,
        longitude: 108.2022,
        averageRating: 4.8,
        totalReviews: 156,
        images: ["/courts/court1.jpg", "/courts/court2.jpg"],
        pricing: [
            {
                timeSlot: "05:00 - 07:00",
                weekdayPrice: 80000,
                weekendPrice: 90000,
            },
            {
                timeSlot: "07:00 - 09:00",
                weekdayPrice: 100000,
                weekendPrice: 120000,
            },
            {
                timeSlot: "09:00 - 11:00",
                weekdayPrice: 90000,
                weekendPrice: 110000,
            },
            {
                timeSlot: "11:00 - 13:00",
                weekdayPrice: 80000,
                weekendPrice: 100000,
            },
            {
                timeSlot: "13:00 - 15:00",
                weekdayPrice: 70000,
                weekendPrice: 90000,
            },
            {
                timeSlot: "15:00 - 17:00",
                weekdayPrice: 90000,
                weekendPrice: 110000,
            },
            {
                timeSlot: "17:00 - 19:00",
                weekdayPrice: 120000,
                weekendPrice: 140000,
            },
            {
                timeSlot: "19:00 - 21:00",
                weekdayPrice: 130000,
                weekendPrice: 150000,
            },
            {
                timeSlot: "21:00 - 23:00",
                weekdayPrice: 110000,
                weekendPrice: 130000,
            },
        ],
    },
    {
        id: 2,
        name: "Arena Badminton Club",
        address: "456 Lê Duẩn, Hải Châu, Đà Nẵng",
        description:
            "Câu lạc bộ cầu lông cao cấp với 6 sân thi đấu tiêu chuẩn quốc tế. Hệ thống âm thanh hiện đại, camera theo dõi trận đấu. Dịch vụ huấn luyện chuyên nghiệp.",
        phone: "0236.3567.888",
        email: "info@arenabadminton.vn",
        operatingHours: "06:00 - 22:30",
        sportTypes: "Cầu lông, Pickleball",
        amenities:
            "Điều hòa cao cấp, Phòng VIP, Massage, Quầy bar, Camera trận đấu, Huấn luyện viên",
        latitude: 16.0678,
        longitude: 108.2208,
        averageRating: 4.9,
        totalReviews: 89,
        images: ["/courts/court1.jpg", "/courts/court2.jpg"],
        pricing: [
            {
                timeSlot: "06:00 - 08:00",
                weekdayPrice: 100000,
                weekendPrice: 120000,
            },
            {
                timeSlot: "08:00 - 10:00",
                weekdayPrice: 120000,
                weekendPrice: 140000,
            },
            {
                timeSlot: "10:00 - 12:00",
                weekdayPrice: 110000,
                weekendPrice: 130000,
            },
            {
                timeSlot: "12:00 - 14:00",
                weekdayPrice: 90000,
                weekendPrice: 110000,
            },
            {
                timeSlot: "14:00 - 16:00",
                weekdayPrice: 100000,
                weekendPrice: 120000,
            },
            {
                timeSlot: "16:00 - 18:00",
                weekdayPrice: 130000,
                weekendPrice: 150000,
            },
            {
                timeSlot: "18:00 - 20:00",
                weekdayPrice: 150000,
                weekendPrice: 180000,
            },
            {
                timeSlot: "20:00 - 22:30",
                weekdayPrice: 140000,
                weekendPrice: 160000,
            },
        ],
    },
    {
        id: 3,
        name: "Sân Cầu Lông Hòa Khánh",
        address: "789 Tôn Đức Thắng, Hòa Khánh Nam, Liên Chiểu, Đà Nẵng",
        description:
            "Sân cầu lông bình dân với 4 sân thi đấu, giá cả phải chăng. Không gian thoáng mát, thuận tiện cho sinh viên và người dân địa phương.",
        phone: "0236.3234.777",
        email: "hoakhanh.badminton@gmail.com",
        operatingHours: "05:30 - 22:00",
        sportTypes: "Cầu lông",
        amenities: "Quạt mát, Phòng thay đồ, Bãi đỗ xe, Nước uống",
        latitude: 16.0732,
        longitude: 108.1525,
        averageRating: 4.2,
        totalReviews: 67,
        images: ["/courts/court1.jpg"],
        pricing: [
            {
                timeSlot: "05:30 - 07:00",
                weekdayPrice: 50000,
                weekendPrice: 60000,
            },
            {
                timeSlot: "07:00 - 09:00",
                weekdayPrice: 60000,
                weekendPrice: 70000,
            },
            {
                timeSlot: "09:00 - 11:00",
                weekdayPrice: 55000,
                weekendPrice: 65000,
            },
            {
                timeSlot: "11:00 - 13:00",
                weekdayPrice: 50000,
                weekendPrice: 60000,
            },
            {
                timeSlot: "13:00 - 15:00",
                weekdayPrice: 45000,
                weekendPrice: 55000,
            },
            {
                timeSlot: "15:00 - 17:00",
                weekdayPrice: 60000,
                weekendPrice: 70000,
            },
            {
                timeSlot: "17:00 - 19:00",
                weekdayPrice: 70000,
                weekendPrice: 80000,
            },
            {
                timeSlot: "19:00 - 21:00",
                weekdayPrice: 75000,
                weekendPrice: 85000,
            },
            {
                timeSlot: "21:00 - 22:00",
                weekdayPrice: 65000,
                weekendPrice: 75000,
            },
        ],
    },
    {
        id: 4,
        name: "Premier Sports Complex",
        address: "321 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng",
        description:
            "Khu liên hợp thể thao đa năng với 10 sân cầu lông và 4 sân pickleball. Tiêu chuẩn quốc tế, phục vụ thi đấu chuyên nghiệp. Có nhà hàng, spa và cửa hàng thể thao.",
        phone: "0236.3999.555",
        email: "booking@premiersports.vn",
        operatingHours: "05:00 - 24:00",
        sportTypes: "Cầu lông, Pickleball",
        amenities:
            "Điều hòa VIP, Spa, Nhà hàng, Cửa hàng thể thao, Dịch vụ giặt đồ, Phòng họp",
        latitude: 16.0139,
        longitude: 108.2522,
        averageRating: 4.7,
        totalReviews: 234,
        images: ["/courts/court1.jpg", "/courts/court2.jpg"],
        pricing: [
            {
                timeSlot: "05:00 - 07:00",
                weekdayPrice: 120000,
                weekendPrice: 140000,
            },
            {
                timeSlot: "07:00 - 09:00",
                weekdayPrice: 140000,
                weekendPrice: 160000,
            },
            {
                timeSlot: "09:00 - 11:00",
                weekdayPrice: 130000,
                weekendPrice: 150000,
            },
            {
                timeSlot: "11:00 - 13:00",
                weekdayPrice: 110000,
                weekendPrice: 130000,
            },
            {
                timeSlot: "13:00 - 15:00",
                weekdayPrice: 100000,
                weekendPrice: 120000,
            },
            {
                timeSlot: "15:00 - 17:00",
                weekdayPrice: 140000,
                weekendPrice: 160000,
            },
            {
                timeSlot: "17:00 - 19:00",
                weekdayPrice: 180000,
                weekendPrice: 200000,
            },
            {
                timeSlot: "19:00 - 21:00",
                weekdayPrice: 200000,
                weekendPrice: 220000,
            },
            {
                timeSlot: "21:00 - 24:00",
                weekdayPrice: 160000,
                weekendPrice: 180000,
            },
        ],
    },
];

export class CourtService {
    /**
     * Lấy danh sách tất cả sân với phân trang (Mock data)
     */
    async getCourts(
        params: {
            page?: number;
            size?: number;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<Court>>> {
        try {
            const { page = 0, size = 20 } = params;
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const courts = MOCK_COURTS.slice(startIndex, endIndex);

            const response: ApiResponse<PaginatedResponse<Court>> = {
                success: true,
                message: "Lấy danh sách sân thành công",
                data: {
                    content: courts,
                    totalElements: MOCK_COURTS.length,
                    totalPages: Math.ceil(MOCK_COURTS.length / size),
                    size: size,
                    number: page,
                    first: page === 0,
                    last: page >= Math.ceil(MOCK_COURTS.length / size) - 1,
                    numberOfElements: courts.length,
                    empty: courts.length === 0,
                },
            };

            return response;
        } catch (error) {
            console.error("Get courts error:", error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết sân (Mock data)
     */
    async getCourtById(id: number): Promise<ApiResponse<Court>> {
        try {
            const court = MOCK_COURTS.find((c) => c.id === id);

            if (!court) {
                throw new Error("Sân không tồn tại");
            }

            const response: ApiResponse<Court> = {
                success: true,
                message: "Lấy thông tin sân thành công",
                data: court,
            };

            return response;
        } catch (error) {
            console.error("Get court by id error:", error);
            throw error;
        }
    }

    /**
     * Tìm kiếm sân với các bộ lọc (Mock data)
     */
    async searchCourts(
        params: CourtSearchParams
    ): Promise<ApiResponse<PaginatedResponse<Court>>> {
        try {
            let filteredCourts = [...MOCK_COURTS];

            // Filter by keyword
            if (params.keyword) {
                const keyword = params.keyword.toLowerCase();
                filteredCourts = filteredCourts.filter(
                    (court) =>
                        court.name.toLowerCase().includes(keyword) ||
                        court.address.toLowerCase().includes(keyword) ||
                        (court.description &&
                            court.description.toLowerCase().includes(keyword))
                );
            }

            // Filter by sport type
            if (params.sportType) {
                filteredCourts = filteredCourts.filter(
                    (court) =>
                        court.sportTypes &&
                        court.sportTypes.includes(params.sportType!)
                );
            }

            // Filter by rating
            if (params.minRating) {
                filteredCourts = filteredCourts.filter(
                    (court) =>
                        court.averageRating &&
                        court.averageRating >= params.minRating!
                );
            }

            const { page = 0, size = 20 } = params;
            const startIndex = page * size;
            const endIndex = startIndex + size;
            const courts = filteredCourts.slice(startIndex, endIndex);

            const response: ApiResponse<PaginatedResponse<Court>> = {
                success: true,
                message: "Tìm kiếm sân thành công",
                data: {
                    content: courts,
                    totalElements: filteredCourts.length,
                    totalPages: Math.ceil(filteredCourts.length / size),
                    size: size,
                    number: page,
                    first: page === 0,
                    last: page >= Math.ceil(filteredCourts.length / size) - 1,
                    numberOfElements: courts.length,
                    empty: courts.length === 0,
                },
            };

            return response;
        } catch (error) {
            console.error("Search courts error:", error);
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
