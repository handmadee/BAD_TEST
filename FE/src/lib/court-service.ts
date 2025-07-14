import { apiClient } from "./api-client";
import {
    Court,
    CreateCourtRequest,
    CourtSearchParams,
    PaginatedResponse,
    ApiResponse,
} from "@/types/api";

// Mock data cho courts
const mockCourts: Court[] = [
    {
        id: 1,
        name: "Sân Cầu Lông Index Sports",
        description:
            "Sân cầu lông chất lượng cao với hệ thống ánh sáng LED hiện đại, sàn gỗ chuyên dụng. Phù hợp cho cả đấu tập luyện và thi đấu chuyên nghiệp.",
        address: "270 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng",
        city: "Đà Nẵng",
        district: "Thanh Khê",
        latitude: 16.0544,
        longitude: 108.2022,
        phone: "0236.123.4567",
        email: "contact@abcsports.vn",
        facebookUrl: "https://facebook.com/abcsports",
        operatingHours: "06:00 - 23:00",
        sportTypes: "Cầu lông, Pickleball",
        amenities:
            "Máy lạnh, Wifi miễn phí, Đỗ xe miễn phí, Căng tin, Tủ khóa, Thuê vợt",
        images: [
            "/courts/court1.jpg",
            "/courts/court2.jpg",
            "/courts/court-placeholder.jpg",
        ],
        coverImage: "/courts/court1.jpg",
        averageRating: 4.8,
        totalReviews: 156,
        status: "ACTIVE",
        featured: true,
        distance: 2.5,
        price: "120,000 - 180,000 VNĐ/giờ",
        totalCourts: 8,
    },
    {
        id: 2,
        name: "Trung Tâm Cầu Lông Đà Nẵng",
        description:
            "Sân cầu lông tiêu chuẩn quốc tế, được trang bị đầy đủ thiết bị hiện đại. Không gian rộng rãi, thoáng mát với 12 sân cầu lông chất lượng cao.",
        address: "123 Lê Duẩn, Hải Châu, Đà Nẵng",
        city: "Đà Nẵng",
        district: "Hải Châu",
        latitude: 16.0678,
        longitude: 108.2208,
        phone: "0236.987.6543",
        email: "info@badmintondn.com",
        facebookUrl: "https://facebook.com/badmintondn",
        operatingHours: "05:30 - 22:30",
        sportTypes: "Cầu lông",
        amenities:
            "Máy lạnh, Wifi, Bãi đỗ xe, Căng tin, Thuê vợt, Phòng thay đồ",
        images: ["/courts/court2.jpg", "/courts/court1.jpg"],
        coverImage: "/courts/court2.jpg",
        averageRating: 4.6,
        totalReviews: 89,
        status: "ACTIVE",
        featured: false,
        distance: 5.2,
        price: "100,000 - 160,000 VNĐ/giờ",
        totalCourts: 12,
    },
    {
        id: 3,
        name: "Golden Court Badminton",
        description:
            "Hệ thống sân cầu lông cao cấp với 6 sân tiêu chuẩn thi đấu. Trang bị máy lạnh inverter, sàn gỗ Malaysia cao cấp.",
        address: "456 Nguyễn Hữu Thọ, Khuê Trung, Cẩm Lệ, Đà Nẵng",
        city: "Đà Nẵng",
        district: "Cẩm Lệ",
        latitude: 16.0144,
        longitude: 108.1525,
        phone: "0236.555.7890",
        email: "booking@goldencourt.vn",
        facebookUrl: "https://facebook.com/goldencourt",
        operatingHours: "06:00 - 22:00",
        sportTypes: "Cầu lông, Tennis",
        amenities:
            "Máy lạnh cao cấp, Wifi, Bãi đỗ xe rộng, Căng tin, Massage, Thuê vợt cao cấp",
        images: ["/courts/court-placeholder.jpg", "/courts/court1.jpg"],
        coverImage: "/courts/court-placeholder.jpg",
        averageRating: 4.9,
        totalReviews: 203,
        status: "ACTIVE",
        featured: true,
        distance: 8.1,
        price: "150,000 - 220,000 VNĐ/giờ",
        totalCourts: 6,
    },
    {
        id: 4,
        name: "Dragon Sports Complex",
        description:
            "Quần thể thể thao hiện đại với 15 sân cầu lông, trang bị thiết bị châu Âu. Phục vụ từ người mới bắt đầu đến VĐV chuyên nghiệp.",
        address: "789 Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
        city: "Đà Nẵng",
        district: "Sơn Trà",
        latitude: 16.0838,
        longitude: 108.25,
        phone: "0236.111.2222",
        email: "info@dragonsports.vn",
        facebookUrl: "https://facebook.com/dragonsports",
        operatingHours: "05:00 - 24:00",
        sportTypes: "Cầu lông, Pickleball, Tennis, Bóng bàn",
        amenities:
            "Máy lạnh, Wifi, Bãi đỗ xe, Căng tin, Massage, Thuê vợt, Phòng tập gym, Hồ bơi",
        images: ["/courts/court2.jpg", "/courts/court-placeholder.jpg"],
        coverImage: "/courts/court2.jpg",
        averageRating: 4.7,
        totalReviews: 312,
        status: "ACTIVE",
        featured: true,
        distance: 12.3,
        price: "80,000 - 200,000 VNĐ/giờ",
        totalCourts: 15,
    },
    {
        id: 5,
        name: "Sky Badminton Arena",
        description:
            "Sân cầu lông sang trọng trên tầng cao với view toàn cảnh thành phố. 10 sân chuẩn quốc tế với hệ thống âm thanh, ánh sáng hiện đại.",
        address: "321 Trần Phú, Thạch Thang, Hải Châu, Đà Nẵng",
        city: "Đà Nẵng",
        district: "Hải Châu",
        latitude: 16.0753,
        longitude: 108.2194,
        phone: "0236.333.4444",
        email: "reservation@skyarena.vn",
        facebookUrl: "https://facebook.com/skyarena",
        operatingHours: "06:00 - 23:00",
        sportTypes: "Cầu lông",
        amenities:
            "Máy lạnh cao cấp, Wifi VIP, Valet parking, Restaurant, Bar, Spa, Thuê vợt cao cấp",
        images: ["/courts/court1.jpg", "/courts/court2.jpg"],
        coverImage: "/courts/court1.jpg",
        averageRating: 4.9,
        totalReviews: 145,
        status: "ACTIVE",
        featured: true,
        distance: 6.8,
        price: "200,000 - 300,000 VNĐ/giờ",
        totalCourts: 10,
    },
];

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
            // Return mock data
            const { page = 0, size = 20 } = params;
            const start = page * size;
            const end = start + size;
            const paginatedCourts = mockCourts.slice(start, end);

            const response: ApiResponse<PaginatedResponse<Court>> = {
                success: true,
                message: "Lấy danh sách sân thành công",
                data: {
                    content: paginatedCourts,
                    totalElements: mockCourts.length,
                    totalPages: Math.ceil(mockCourts.length / size),
                    size: size,
                    number: page,
                    numberOfElements: paginatedCourts.length,
                    first: page === 0,
                    last: end >= mockCourts.length,
                    empty: paginatedCourts.length === 0,
                },
            };

            return response;
        } catch (error) {
            console.error("Get courts error:", error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết sân theo ID
     */
    async getCourtById(id: number): Promise<ApiResponse<Court>> {
        try {
            const court = mockCourts.find((c) => c.id === id);

            if (!court) {
                throw new Error(`Không tìm thấy sân với ID ${id}`);
            }

            const response: ApiResponse<Court> = {
                success: true,
                message: "Lấy thông tin sân thành công",
                data: court,
            };

            return response;
        } catch (error) {
            console.error("Get court by ID error:", error);
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
            const {
                keyword,
                sportType,
                minRating,
                latitude,
                longitude,
                radius,
                page = 0,
                size = 20,
            } = params;

            let filteredCourts = [...mockCourts];

            // Filter by keyword
            if (keyword) {
                filteredCourts = filteredCourts.filter(
                    (court) =>
                        court.name
                            .toLowerCase()
                            .includes(keyword.toLowerCase()) ||
                        court.address
                            .toLowerCase()
                            .includes(keyword.toLowerCase()) ||
                        (court.description &&
                            court.description
                                .toLowerCase()
                                .includes(keyword.toLowerCase()))
                );
            }

            // Filter by sport type
            if (sportType) {
                filteredCourts = filteredCourts.filter(
                    (court) =>
                        court.sportTypes &&
                        court.sportTypes
                            .toLowerCase()
                            .includes(sportType.toLowerCase())
                );
            }

            // Filter by rating
            if (minRating) {
                filteredCourts = filteredCourts.filter(
                    (court) =>
                        court.averageRating && court.averageRating >= minRating
                );
            }

            // Pagination
            const start = page * size;
            const end = start + size;
            const paginatedCourts = filteredCourts.slice(start, end);

            const response: ApiResponse<PaginatedResponse<Court>> = {
                success: true,
                message: "Tìm kiếm sân thành công",
                data: {
                    content: paginatedCourts,
                    totalElements: filteredCourts.length,
                    totalPages: Math.ceil(filteredCourts.length / size),
                    size: size,
                    number: page,
                    numberOfElements: paginatedCourts.length,
                    first: page === 0,
                    last: end >= filteredCourts.length,
                    empty: paginatedCourts.length === 0,
                },
            };

            return response;
        } catch (error) {
            console.error("Search courts error:", error);
            throw error;
        }
    }

    /**
     * Lấy sân gần vị trí hiện tại
     */
    async getNearbyCourts(params: {
        latitude: number;
        longitude: number;
        radius?: number;
    }): Promise<ApiResponse<Court[]>> {
        try {
            // Return mock nearby courts
            const nearbyCourts = mockCourts.slice(0, 3);

            const response: ApiResponse<Court[]> = {
                success: true,
                message: "Lấy sân gần thành công",
                data: nearbyCourts,
            };

            return response;
        } catch (error) {
            console.error("Get nearby courts error:", error);
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
     * Lấy chi tiết đầy đủ của sân
     */
    async getCourtDetails(id: number): Promise<ApiResponse<any>> {
        try {
            const court = mockCourts.find((c) => c.id === id);

            if (!court) {
                throw new Error(`Không tìm thấy sân với ID ${id}`);
            }

            // Mock detailed data
            const detailedCourt = {
                ...court,
                reviews: [
                    {
                        id: 1,
                        userId: 1,
                        userName: "Nguyễn Văn A",
                        userAvatar: "/avatars/minhhoang.jpg",
                        rating: 5,
                        comment: "Sân rất đẹp, dịch vụ tốt. Sẽ quay lại!",
                        createdAt: "2024-01-15T10:30:00Z",
                    },
                    {
                        id: 2,
                        userId: 2,
                        userName: "Trần Thị B",
                        userAvatar: "/avatars/thaochi.jpg",
                        rating: 4,
                        comment:
                            "Sân sạch sẽ, nhân viên nhiệt tình. Giá hợp lý.",
                        createdAt: "2024-01-10T14:20:00Z",
                    },
                ],
                pricings: [
                    {
                        id: 1,
                        timeSlot: "06:00 - 17:00",
                        price:
                            court.id === 1
                                ? 120000
                                : court.id === 2
                                ? 100000
                                : court.id === 3
                                ? 150000
                                : court.id === 4
                                ? 120000
                                : 200000,
                        dayType: "WEEKDAY",
                    },
                    {
                        id: 2,
                        timeSlot: "17:00 - 23:00",
                        price:
                            court.id === 1
                                ? 150000
                                : court.id === 2
                                ? 130000
                                : court.id === 3
                                ? 180000
                                : court.id === 4
                                ? 150000
                                : 250000,
                        dayType: "WEEKDAY",
                    },
                    {
                        id: 3,
                        timeSlot: "06:00 - 17:00",
                        price:
                            court.id === 1
                                ? 150000
                                : court.id === 2
                                ? 130000
                                : court.id === 3
                                ? 180000
                                : court.id === 4
                                ? 150000
                                : 250000,
                        dayType: "WEEKEND",
                    },
                    {
                        id: 4,
                        timeSlot: "17:00 - 23:00",
                        price:
                            court.id === 1
                                ? 180000
                                : court.id === 2
                                ? 160000
                                : court.id === 3
                                ? 220000
                                : court.id === 4
                                ? 200000
                                : 300000,
                        dayType: "WEEKEND",
                    },
                ],
                availableSlots: [
                    { time: "06:00", available: true },
                    { time: "07:00", available: false },
                    { time: "08:00", available: true },
                    { time: "09:00", available: true },
                    { time: "10:00", available: false },
                    { time: "11:00", available: true },
                    { time: "14:00", available: true },
                    { time: "15:00", available: true },
                    { time: "16:00", available: false },
                    { time: "17:00", available: true },
                    { time: "18:00", available: true },
                    { time: "19:00", available: false },
                    { time: "20:00", available: true },
                    { time: "21:00", available: true },
                ],
            };

            const response: ApiResponse<any> = {
                success: true,
                message: "Lấy chi tiết sân thành công",
                data: detailedCourt,
            };

            return response;
        } catch (error) {
            console.error("Get court details error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách loại sân
     */
    async getCourtTypes(): Promise<ApiResponse<any[]>> {
        try {
            const courtTypes = [
                { id: 1, name: "Cầu lông", icon: "🏸" },
                { id: 2, name: "Pickleball", icon: "🎾" },
                { id: 3, name: "Tennis", icon: "🎾" },
                { id: 4, name: "Bóng bàn", icon: "🏓" },
            ];

            const response: ApiResponse<any[]> = {
                success: true,
                message: "Lấy loại sân thành công",
                data: courtTypes,
            };

            return response;
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
            const stats = {
                totalTeamPosts: mockCourts.length * 2,
                activePosts: mockCourts.length,
                totalCourts: mockCourts.length,
                totalBookings: mockCourts.length * 5,
            };

            const response: ApiResponse<any> = {
                success: true,
                message: "Lấy thống kê thành công",
                data: stats,
            };

            return response;
        } catch (error) {
            console.error("Get dashboard stats error:", error);
            throw error;
        }
    }
}

// Export instance và các helper functions
export const courtService = new CourtService();

export const getCourts = (params?: { page?: number; size?: number }) =>
    courtService.getCourts(params);

export const getCourtById = (id: number) => courtService.getCourtById(id);

export const searchCourts = (params: CourtSearchParams) =>
    courtService.searchCourts(params);

export const getNearbyCourts = (params: {
    latitude: number;
    longitude: number;
    radius?: number;
}) => courtService.getNearbyCourts(params);

export const createCourt = (courtData: CreateCourtRequest) =>
    courtService.createCourt(courtData);

export const updateCourt = (
    id: number,
    courtData: Partial<CreateCourtRequest>
) => courtService.updateCourt(id, courtData);

export const deleteCourt = (id: number) => courtService.deleteCourt(id);

export const getCourtDetails = (id: number) => courtService.getCourtDetails(id);

export const getCourtTypes = () => courtService.getCourtTypes();

export const getDashboardStats = () => courtService.getDashboardStats();
