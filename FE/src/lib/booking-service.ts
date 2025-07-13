import { apiClient } from "./api-client";
import {
    Booking,
    CreateBookingRequest,
    PaginatedResponse,
    ApiResponse,
} from "@/types/api";

export class BookingService {
    /**
     * Tạo booking mới
     */
    async createBooking(
        bookingData: CreateBookingRequest
    ): Promise<ApiResponse<Booking>> {
        try {
            return await apiClient.post<Booking>("/bookings", bookingData);
        } catch (error) {
            console.error("Create booking error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách booking của người dùng hiện tại
     */
    async getMyBookings(
        params: {
            page?: number;
            size?: number;
            status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
        try {
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<Booking>>(
                "/bookings/my-bookings",
                defaultParams
            );
        } catch (error) {
            console.error("Get my bookings error:", error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết của một booking
     */
    async getBookingById(id: number): Promise<ApiResponse<Booking>> {
        try {
            return await apiClient.get<Booking>(`/bookings/${id}`);
        } catch (error) {
            console.error("Get booking by id error:", error);
            throw error;
        }
    }

    /**
     * Hủy booking
     */
    async cancelBooking(
        id: number,
        reason?: string
    ): Promise<ApiResponse<Booking>> {
        try {
            return await apiClient.patch<Booking>(`/bookings/${id}/cancel`, {
                reason,
            });
        } catch (error) {
            console.error("Cancel booking error:", error);
            throw error;
        }
    }

    /**
     * Cập nhật trạng thái booking
     */
    async updateBookingStatus(
        id: number,
        status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
    ): Promise<ApiResponse<Booking>> {
        try {
            return await apiClient.patch<Booking>(`/bookings/${id}/status`, {
                status,
            });
        } catch (error) {
            console.error("Update booking status error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách booking theo sân (cho chủ sân)
     */
    async getCourtBookings(
        courtId: number,
        params: {
            page?: number;
            size?: number;
            startDate?: string;
            endDate?: string;
            status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
        try {
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<Booking>>(
                `/courts/${courtId}/bookings`,
                defaultParams
            );
        } catch (error) {
            console.error("Get court bookings error:", error);
            throw error;
        }
    }

    /**
     * Kiểm tra tính khả dụng của sân
     */
    async checkAvailability(params: {
        courtId: number;
        date: string;
        startTime: string;
        endTime: string;
    }): Promise<
        ApiResponse<{
            available: boolean;
            conflicts?: Booking[];
            suggestedTimes?: string[];
        }>
    > {
        try {
            return await apiClient.get(`/bookings/check-availability`, params);
        } catch (error) {
            console.error("Check availability error:", error);
            throw error;
        }
    }

    /**
     * Lấy thống kê booking
     */
    async getBookingStats(
        params: {
            courtId?: number;
            startDate?: string;
            endDate?: string;
        } = {}
    ): Promise<
        ApiResponse<{
            totalBookings: number;
            totalRevenue: number;
            confirmedBookings: number;
            cancelledBookings: number;
            pendingBookings: number;
            averageBookingValue: number;
            popularTimeSlots: { time: string; count: number }[];
            monthlyStats: {
                month: string;
                bookings: number;
                revenue: number;
            }[];
        }>
    > {
        try {
            return await apiClient.get("/bookings/stats", params);
        } catch (error) {
            console.error("Get booking stats error:", error);
            throw error;
        }
    }

    /**
     * Lấy lịch booking của sân theo ngày
     */
    async getCourtSchedule(
        courtId: number,
        date: string
    ): Promise<
        ApiResponse<{
            date: string;
            bookings: {
                id: number;
                startTime: string;
                endTime: string;
                status: string;
                user: {
                    id: number;
                    fullName: string;
                    phone?: string;
                };
            }[];
            availableSlots: {
                startTime: string;
                endTime: string;
                price: number;
            }[];
        }>
    > {
        try {
            return await apiClient.get(`/courts/${courtId}/schedule`, { date });
        } catch (error) {
            console.error("Get court schedule error:", error);
            throw error;
        }
    }

    /**
     * Xác nhận booking (cho chủ sân)
     */
    async confirmBooking(id: number): Promise<ApiResponse<Booking>> {
        try {
            return await apiClient.patch<Booking>(`/bookings/${id}/confirm`);
        } catch (error) {
            console.error("Confirm booking error:", error);
            throw error;
        }
    }

    /**
     * Hoàn thành booking
     */
    async completeBooking(id: number): Promise<ApiResponse<Booking>> {
        try {
            return await apiClient.patch<Booking>(`/bookings/${id}/complete`);
        } catch (error) {
            console.error("Complete booking error:", error);
            throw error;
        }
    }

    /**
     * Tính toán giá booking
     */
    async calculatePrice(params: {
        courtId: number;
        date: string;
        startTime: string;
        endTime: string;
    }): Promise<
        ApiResponse<{
            totalPrice: number;
            pricePerHour: number;
            duration: number;
            breakdown: {
                time: string;
                price: number;
            }[];
        }>
    > {
        try {
            return await apiClient.get("/bookings/calculate-price", params);
        } catch (error) {
            console.error("Calculate price error:", error);
            throw error;
        }
    }

    /**
     * Lấy lịch sử booking
     */
    async getBookingHistory(
        params: {
            page?: number;
            size?: number;
            startDate?: string;
            endDate?: string;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<Booking>>> {
        try {
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<Booking>>(
                "/bookings/history",
                defaultParams
            );
        } catch (error) {
            console.error("Get booking history error:", error);
            throw error;
        }
    }

    /**
     * Tìm kiếm booking
     */
    async searchBookings(params: {
        keyword?: string;
        courtId?: number;
        userId?: number;
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
        startDate?: string;
        endDate?: string;
        page?: number;
        size?: number;
    }): Promise<ApiResponse<PaginatedResponse<Booking>>> {
        try {
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<Booking>>(
                "/bookings/search",
                defaultParams
            );
        } catch (error) {
            console.error("Search bookings error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách booking của user (dùng để tương thích với API cũ)
     */
    async getUserBookings(userId: string): Promise<any[]> {
        try {
            const response = await this.getMyBookings();
            return response.data.content || [];
        } catch (error) {
            console.error("Get user bookings error:", error);
            return [];
        }
    }
}

// Singleton instance
export const bookingService = new BookingService();

// Helper functions để sử dụng trực tiếp
export const createBooking = (bookingData: CreateBookingRequest) =>
    bookingService.createBooking(bookingData);

export const getMyBookings = (params?: {
    page?: number;
    size?: number;
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}) => bookingService.getMyBookings(params);

export const getBookingById = (id: number) => bookingService.getBookingById(id);

export const cancelBooking = (id: number, reason?: string) =>
    bookingService.cancelBooking(id, reason);

export const checkAvailability = (params: {
    courtId: number;
    date: string;
    startTime: string;
    endTime: string;
}) => bookingService.checkAvailability(params);

export const calculatePrice = (params: {
    courtId: number;
    date: string;
    startTime: string;
    endTime: string;
}) => bookingService.calculatePrice(params);
