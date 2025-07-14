import { ApiResponse, ApiError as ApiErrorType } from "@/types/api";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

export class ApiError extends Error {
    constructor(
        public message: string,
        public status: number,
        public response?: any
    ) {
        super(message);
        this.name = "ApiError";
    }
}

class ApiClient {
    private token: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        // Khởi tạo token từ localStorage nếu có
        if (typeof window !== "undefined") {
            this.token = localStorage.getItem("token");
            this.refreshToken = localStorage.getItem("refreshToken");
        }
    }

    setTokens(token: string, refreshToken?: string) {
        this.token = token;
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }

        if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }
        }
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;

        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
        }
    }

    getToken(): string | null {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers: Record<string, string> = {
            ...((options.headers as Record<string, string>) || {}),
        };

        // Only set Content-Type if body is not FormData
        // FormData needs browser to auto-set boundary
        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        // Thêm Authorization header nếu có token
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Nếu token hết hạn (401), thử refresh token
                if (response.status === 401 && this.refreshToken) {
                    const refreshed = await this.refreshAccessToken();
                    if (refreshed) {
                        // Thử lại request với token mới
                        headers.Authorization = `Bearer ${this.token}`;
                        const retryResponse = await fetch(url, {
                            ...config,
                            headers,
                        });
                        const retryData = await retryResponse.json();

                        if (!retryResponse.ok) {
                            throw new ApiError(
                                retryData.message || "Request failed",
                                retryResponse.status,
                                retryData
                            );
                        }
                        return retryData;
                    }
                }

                throw new ApiError(
                    data.message || "Request failed",
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            // Network error hoặc lỗi khác
            throw new ApiError("Network error or server unavailable", 0, error);
        }
    }

    private async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken: this.refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.token) {
                    this.setTokens(data.data.token, data.data.refreshToken);
                    return true;
                }
            }
        } catch (error) {
            console.error("Failed to refresh token:", error);
        }

        // Nếu refresh thất bại, xóa tokens
        this.clearTokens();
        return false;
    }

    // HTTP methods
    async get<T>(
        endpoint: string,
        params?: Record<string, any>
    ): Promise<ApiResponse<T>> {
        let url = endpoint;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        return this.request<T>(url, { method: "GET" });
    }

    async post<T>(
        endpoint: string,
        data?: any,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        // Handle FormData differently - don't JSON.stringify it
        const body =
            data instanceof FormData
                ? data
                : data
                ? JSON.stringify(data)
                : undefined;

        return this.request<T>(endpoint, {
            method: "POST",
            body,
            ...options,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}

// Singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse };
