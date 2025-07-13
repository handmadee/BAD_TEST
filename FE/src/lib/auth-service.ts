import { apiClient, ApiError } from "./api-client";
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    User,
    ApiResponse,
} from "@/types/api";

export class AuthService {
    /**
     * Đăng nhập người dùng
     */
    async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await apiClient.post<AuthResponse>(
                "/auth/login",
                credentials
            );

            if (response.success && response.data) {
                // Lưu tokens vào localStorage và set cho apiClient
                apiClient.setTokens(
                    response.data.accessToken,
                    response.data.refreshToken
                );
            }

            return response;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    /**
     * Đăng ký người dùng mới
     */
    async register(
        userData: RegisterRequest
    ): Promise<ApiResponse<AuthResponse>> {
        try {
            const response = await apiClient.post<AuthResponse>(
                "/auth/register",
                userData
            );

            if (response.success && response.data) {
                // Tự động đăng nhập sau khi đăng ký thành công
                apiClient.setTokens(
                    response.data.accessToken,
                    response.data.refreshToken
                );
            }

            return response;
        } catch (error) {
            console.error("Register error:", error);
            throw error;
        }
    }

    /**
     * Lấy thông tin người dùng hiện tại
     */
    async getCurrentUser(): Promise<ApiResponse<User>> {
        try {
            return await apiClient.get<User>("/auth/me");
        } catch (error) {
            console.error("Get current user error:", error);
            throw error;
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<ApiResponse<AuthResponse>> {
        try {
            const refreshToken =
                typeof window !== "undefined"
                    ? localStorage.getItem("refreshToken")
                    : null;

            if (!refreshToken) {
                throw new ApiError("No refresh token available", 401);
            }

            const response = await apiClient.post<AuthResponse>(
                "/auth/refresh",
                {
                    refreshToken,
                }
            );

            if (response.success && response.data) {
                apiClient.setTokens(
                    response.data.accessToken,
                    response.data.refreshToken
                );
            }

            return response;
        } catch (error) {
            console.error("Refresh token error:", error);
            this.logout(); // Xóa tokens nếu refresh thất bại
            throw error;
        }
    }

    /**
     * Đăng xuất người dùng
     */
    logout(): void {
        try {
            // Xóa tokens khỏi localStorage và apiClient
            apiClient.clearTokens();

            // Có thể gọi API logout nếu backend có endpoint này
            // await apiClient.post('/auth/logout');

            // Redirect về trang login nếu cần
            if (typeof window !== "undefined") {
                // window.location.href = '/auth/signin';
            }
        } catch (error) {
            console.error("Logout error:", error);
            // Vẫn xóa tokens dù có lỗi
            apiClient.clearTokens();
        }
    }

    /**
     * Kiểm tra xem người dùng đã đăng nhập chưa
     */
    isAuthenticated(): boolean {
        return apiClient.getToken() !== null;
    }

    /**
     * Lấy token hiện tại
     */
    getToken(): string | null {
        return apiClient.getToken();
    }

    /**
     * Kiểm tra và validate token hiện tại
     */
    async validateToken(): Promise<boolean> {
        try {
            if (!this.isAuthenticated()) {
                return false;
            }

            // Thử gọi API để kiểm tra token
            await this.getCurrentUser();
            return true;
        } catch (error) {
            // Nếu token không hợp lệ, xóa nó
            this.logout();
            return false;
        }
    }

    /**
     * Cập nhật profile người dùng
     */
    async updateProfile(updateData: any): Promise<ApiResponse<User>> {
        try {
            return await apiClient.put<User>("/users/profile", updateData);
        } catch (error) {
            console.error("Update profile error:", error);
            throw error;
        }
    }

    /**
     * Khởi tạo auth state từ localStorage
     */
    async initializeAuth(): Promise<User | null> {
        try {
            if (this.isAuthenticated()) {
                const response = await this.getCurrentUser();
                return response.data;
            }
            return null;
        } catch (error) {
            console.error("Initialize auth error:", error);
            this.logout();
            return null;
        }
    }
}

// Singleton instance
export const authService = new AuthService();

// Helper functions
export const isAuthenticated = () => authService.isAuthenticated();
export const getToken = () => authService.getToken();
export const logout = () => authService.logout();
