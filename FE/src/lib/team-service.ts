import { apiClient } from "./api-client";
import {
    TeamPost,
    CreateTeamPostRequest,
    TeamPostSearchParams,
    TeamMember,
    PaginatedResponse,
    ApiResponse,
} from "@/types/api";

export class TeamService {
    /**
     * Lấy danh sách tất cả bài đăng tìm đội với phân trang
     */
    async getTeamPosts(
        params: {
            page?: number;
            size?: number;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<TeamPost>>> {
        try {
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<TeamPost>>(
                "/team-posts",
                defaultParams
            );
        } catch (error) {
            console.error("Get team posts error:", error);
            throw error;
        }
    }

    /**
     * Tìm kiếm bài đăng tìm đội với các bộ lọc
     */
    async searchTeamPosts(
        params: TeamPostSearchParams
    ): Promise<ApiResponse<PaginatedResponse<TeamPost>>> {
        try {
            const defaultParams = {
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<TeamPost>>(
                "/team-posts/search",
                defaultParams
            );
        } catch (error) {
            console.error("Search team posts error:", error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết của một bài đăng
     */
    async getTeamPostById(id: number): Promise<ApiResponse<TeamPost>> {
        try {
            return await apiClient.get<TeamPost>(`/team-posts/${id}`);
        } catch (error) {
            console.error("Get team post by id error:", error);
            throw error;
        }
    }

    /**
     * Tạo bài đăng tìm đội mới
     */
    async createTeamPost(
        postData: CreateTeamPostRequest
    ): Promise<ApiResponse<TeamPost>> {
        try {
            return await apiClient.post<TeamPost>("/team-posts", postData);
        } catch (error) {
            console.error("Create team post error:", error);
            throw error;
        }
    }

    /**
     * Cập nhật bài đăng tìm đội
     */
    async updateTeamPost(
        id: number,
        postData: Partial<CreateTeamPostRequest>
    ): Promise<ApiResponse<TeamPost>> {
        try {
            return await apiClient.put<TeamPost>(`/team-posts/${id}`, postData);
        } catch (error) {
            console.error("Update team post error:", error);
            throw error;
        }
    }

    /**
     * Xóa bài đăng tìm đội
     */
    async deleteTeamPost(id: number): Promise<ApiResponse<void>> {
        try {
            return await apiClient.delete<void>(`/team-posts/${id}`);
        } catch (error) {
            console.error("Delete team post error:", error);
            throw error;
        }
    }

    /**
     * Tham gia đội
     */
    async joinTeam(id: number): Promise<ApiResponse<TeamMember>> {
        try {
            return await apiClient.post<TeamMember>(`/team-posts/${id}/join`);
        } catch (error) {
            console.error("Join team error:", error);
            throw error;
        }
    }

    /**
     * Gửi tin nhắn và yêu cầu tham gia đội
     */
    async sendMessageAndJoinRequest(
        id: number,
        message: string
    ): Promise<ApiResponse<TeamMember>> {
        try {
            const params = new URLSearchParams();
            params.append("message", message);

            return await apiClient.post<TeamMember>(
                `/team-posts/${id}/message-and-join?${params.toString()}`
            );
        } catch (error) {
            console.error("Send message and join request error:", error);
            throw error;
        }
    }

    /**
     * Rời khỏi đội
     */
    async leaveTeam(id: number): Promise<ApiResponse<void>> {
        try {
            return await apiClient.delete<void>(`/team-posts/${id}/leave`);
        } catch (error) {
            console.error("Leave team error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách thành viên của đội
     */
    async getTeamMembers(id: number): Promise<ApiResponse<TeamMember[]>> {
        try {
            return await apiClient.get<TeamMember[]>(
                `/team-posts/${id}/members`
            );
        } catch (error) {
            console.error("Get team members error:", error);
            throw error;
        }
    }

    /**
     * Chấp nhận thành viên vào đội (chỉ creator)
     */
    async acceptMember(
        postId: number,
        memberId: number
    ): Promise<ApiResponse<TeamMember>> {
        try {
            return await apiClient.post<TeamMember>(
                `/team-posts/${postId}/members/${memberId}/accept`
            );
        } catch (error) {
            console.error("Accept member error:", error);
            throw error;
        }
    }

    /**
     * Từ chối thành viên (chỉ creator)
     */
    async rejectMember(
        postId: number,
        memberId: number
    ): Promise<ApiResponse<void>> {
        try {
            return await apiClient.post<void>(
                `/team-posts/${postId}/members/${memberId}/reject`
            );
        } catch (error) {
            console.error("Reject member error:", error);
            throw error;
        }
    }

    /**
     * Xóa thành viên khỏi đội (chỉ creator)
     */
    async removeMember(
        postId: number,
        memberId: number
    ): Promise<ApiResponse<void>> {
        try {
            return await apiClient.delete<void>(
                `/team-posts/${postId}/members/${memberId}`
            );
        } catch (error) {
            console.error("Remove member error:", error);
            throw error;
        }
    }

    /**
     * Đóng/mở bài đăng tìm đội
     */
    async updateTeamPostStatus(
        id: number,
        status: "ACTIVE" | "FULL" | "CANCELLED" | "COMPLETED"
    ): Promise<ApiResponse<TeamPost>> {
        try {
            return await apiClient.patch<TeamPost>(`/team-posts/${id}/status`, {
                status,
            });
        } catch (error) {
            console.error("Update team post status error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách bài đăng của người dùng hiện tại
     */
    async getMyTeamPosts(
        params: {
            page?: number;
            size?: number;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<TeamPost>>> {
        try {
            const searchParams = new URLSearchParams({
                page: (params.page || 0).toString(),
                size: (params.size || 20).toString(),
            });

            return await apiClient.get<PaginatedResponse<TeamPost>>(
                `/team-posts/my-posts?${searchParams}`
            );
        } catch (error) {
            console.error("Get my team posts error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách đội mà người dùng đã tham gia
     */
    async getJoinedTeams(
        params: {
            page?: number;
            size?: number;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<TeamPost>>> {
        try {
            const searchParams = new URLSearchParams({
                page: (params.page || 0).toString(),
                size: (params.size || 20).toString(),
            });

            return await apiClient.get<PaginatedResponse<TeamPost>>(
                `/team-posts/joined-teams?${searchParams}`
            );
        } catch (error) {
            console.error("Get joined teams error:", error);
            throw error;
        }
    }

    /**
     * Lấy thống kê bài đăng tìm đội
     */
    async getTeamPostStats(id: number): Promise<
        ApiResponse<{
            totalMembers: number;
            pendingRequests: number;
            acceptedMembers: number;
            rejectedRequests: number;
        }>
    > {
        try {
            return await apiClient.get(`/team-posts/${id}/stats`);
        } catch (error) {
            console.error("Get team post stats error:", error);
            throw error;
        }
    }

    /**
     * Tìm kiếm bài đăng theo vị trí gần
     */
    async getNearbyTeamPosts(params: {
        latitude: number;
        longitude: number;
        radius?: number; // km
        page?: number;
        size?: number;
    }): Promise<ApiResponse<PaginatedResponse<TeamPost>>> {
        try {
            const defaultParams = {
                radius: 10, // 10km mặc định
                page: 0,
                size: 20,
                ...params,
            };

            return await apiClient.get<PaginatedResponse<TeamPost>>(
                "/team-posts/nearby",
                defaultParams
            );
        } catch (error) {
            console.error("Get nearby team posts error:", error);
            throw error;
        }
    }
}

// Singleton instance
export const teamService = new TeamService();

// Helper functions để sử dụng trực tiếp
export const getTeamPosts = (params?: { page?: number; size?: number }) =>
    teamService.getTeamPosts(params);

export const searchTeamPosts = (params: TeamPostSearchParams) =>
    teamService.searchTeamPosts(params);

export const getTeamPostById = (id: number) => teamService.getTeamPostById(id);

export const createTeamPost = (postData: CreateTeamPostRequest) =>
    teamService.createTeamPost(postData);

export const joinTeam = (id: number) => teamService.joinTeam(id);
export const sendMessageAndJoinRequest = (id: number, message: string) =>
    teamService.sendMessageAndJoinRequest(id, message);

export const getTeamMembers = (id: number) => teamService.getTeamMembers(id);
export const getMyTeamPosts = (params?: { page?: number; size?: number }) =>
    teamService.getMyTeamPosts(params);
export const getJoinedTeams = (params?: { page?: number; size?: number }) =>
    teamService.getJoinedTeams(params);
