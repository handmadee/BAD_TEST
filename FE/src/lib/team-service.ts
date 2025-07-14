import { apiClient } from "./api-client";
import {
    TeamPost,
    CreateTeamPostRequest,
    TeamPostSearchParams,
    TeamMember,
    PaginatedResponse,
    ApiResponse,
} from "@/types/api";

// Mock team posts data
const mockTeamPosts: TeamPost[] = [
    {
        id: 1,
        user: {
            id: 1,
            fullName: "Nguyễn Văn Hoàng",
            email: "hoang@example.com",
        },
        title: "Tìm đối thủ chơi cầu lông buổi tối",
        description:
            "Mình tìm 1-2 người chơi cầu lông buổi tối thứ 7 này tại sân ABC Sports. Level trung bình, chơi vui vẻ thôi nhé!",
        playDate: "2024-01-20T19:00:00",
        location: "Sân ABC Sports, Thanh Khê, Đà Nẵng",
        maxPlayers: 4,
        currentPlayers: 2,
        skillLevel: "Trung bình",
        sportType: "BADMINTON",
        status: "OPEN",
        images: ["/posts/post1.jpg"],
        isFull: false,
        canJoin: true,
        availableSlots: 2,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
    },
    {
        id: 2,
        user: {
            id: 2,
            fullName: "Trần Thị Chi",
            email: "chi@example.com",
        },
        title: "Giao lưu Pickleball cuối tuần",
        description:
            "Nhóm mình tổ chức giao lưu Pickleball vào cuối tuần. Chào mừng mọi level, có huấn luyện viên hướng dẫn cho người mới.",
        playDate: "2024-01-21T08:00:00",
        location: "Golden Court, Cẩm Lệ, Đà Nẵng",
        maxPlayers: 8,
        currentPlayers: 5,
        skillLevel: "Mọi level",
        sportType: "PICKLEBALL",
        status: "OPEN",
        images: ["/posts/post2.jpg"],
        isFull: false,
        canJoin: true,
        availableSlots: 3,
        createdAt: "2024-01-14T14:20:00Z",
        updatedAt: "2024-01-14T14:20:00Z",
    },
    {
        id: 3,
        user: {
            id: 3,
            fullName: "Lê Minh Đức",
            email: "duc@example.com",
        },
        title: "Team cầu lông thi đấu cần thành viên",
        description:
            "Team cầu lông chuyên nghiệp đang tuyển thêm thành viên. Yêu cầu level khá trở lên, có kinh nghiệm thi đấu.",
        playDate: "2024-01-22T17:00:00",
        location: "Dragon Sports Complex, Sơn Trà, Đà Nẵng",
        maxPlayers: 6,
        currentPlayers: 4,
        skillLevel: "Cao",
        sportType: "BADMINTON",
        status: "OPEN",
        images: [],
        isFull: false,
        canJoin: true,
        availableSlots: 2,
        createdAt: "2024-01-13T16:45:00Z",
        updatedAt: "2024-01-13T16:45:00Z",
    },
    {
        id: 4,
        user: {
            id: 4,
            fullName: "Phạm Thị Lan",
            email: "lan@example.com",
        },
        title: "Cầu lông nữ - Tập luyện thường xuyên",
        description:
            "Nhóm cầu lông nữ tập luyện 3 buổi/tuần, sáng thứ 2-4-6. Môi trường thân thiện, phù hợp cho chị em mới bắt đầu.",
        playDate: "2024-01-23T06:30:00",
        location: "Sky Badminton Arena, Hải Châu, Đà Nẵng",
        maxPlayers: 10,
        currentPlayers: 7,
        skillLevel: "Mới bắt đầu",
        sportType: "BADMINTON",
        status: "OPEN",
        images: ["/posts/post1.jpg"],
        isFull: false,
        canJoin: true,
        availableSlots: 3,
        createdAt: "2024-01-12T08:15:00Z",
        updatedAt: "2024-01-12T08:15:00Z",
    },
    {
        id: 5,
        user: {
            id: 5,
            fullName: "Võ Văn Nam",
            email: "nam@example.com",
        },
        title: "Pickleball cho người mới - Học và chơi",
        description:
            "Khóa học Pickleball cơ bản kết hợp chơi thực tế. Có HLV chuyên nghiệp, cung cấp vợt và bóng miễn phí.",
        playDate: "2024-01-24T15:00:00",
        location: "Trung Tâm Cầu Lông Đà Nẵng, Hải Châu",
        maxPlayers: 12,
        currentPlayers: 8,
        skillLevel: "Mới bắt đầu",
        sportType: "PICKLEBALL",
        status: "OPEN",
        images: ["/posts/post2.jpg"],
        isFull: false,
        canJoin: true,
        availableSlots: 4,
        createdAt: "2024-01-11T11:30:00Z",
        updatedAt: "2024-01-11T11:30:00Z",
    },
];

export class TeamService {
    /**
     * Lấy danh sách team posts với phân trang
     */
    async getTeamPosts(
        params: {
            page?: number;
            size?: number;
        } = {}
    ): Promise<ApiResponse<PaginatedResponse<TeamPost>>> {
        try {
            // Return mock data with pagination
            const { page = 0, size = 10 } = params;
            const start = page * size;
            const end = start + size;
            const paginatedPosts = mockTeamPosts.slice(start, end);

            const response: ApiResponse<PaginatedResponse<TeamPost>> = {
                success: true,
                message: "Lấy danh sách bài đăng thành công",
                data: {
                    content: paginatedPosts,
                    totalElements: mockTeamPosts.length,
                    totalPages: Math.ceil(mockTeamPosts.length / size),
                    size: size,
                    number: page,
                    numberOfElements: paginatedPosts.length,
                    first: page === 0,
                    last: end >= mockTeamPosts.length,
                    empty: paginatedPosts.length === 0,
                },
            };

            return response;
        } catch (error) {
            console.error("Get team posts error:", error);
            throw error;
        }
    }

    /**
     * Tìm kiếm team posts
     */
    async searchTeamPosts(
        params: TeamPostSearchParams
    ): Promise<ApiResponse<PaginatedResponse<TeamPost>>> {
        try {
            const {
                keyword,
                sport,
                skillLevel,
                location,
                date,
                page = 0,
                size = 10,
            } = params;

            let filteredPosts = [...mockTeamPosts];

            // Filter by keyword
            if (keyword) {
                filteredPosts = filteredPosts.filter(
                    (post) =>
                        post.title
                            .toLowerCase()
                            .includes(keyword.toLowerCase()) ||
                        post.description
                            .toLowerCase()
                            .includes(keyword.toLowerCase()) ||
                        post.location
                            .toLowerCase()
                            .includes(keyword.toLowerCase())
                );
            }

            // Filter by sport
            if (sport) {
                filteredPosts = filteredPosts.filter(
                    (post) =>
                        post.sportType.toLowerCase() === sport.toLowerCase() ||
                        (sport.toLowerCase() === "cầu lông" &&
                            post.sportType === "BADMINTON") ||
                        (sport.toLowerCase() === "pickleball" &&
                            post.sportType === "PICKLEBALL")
                );
            }

            // Filter by skill level
            if (skillLevel) {
                filteredPosts = filteredPosts.filter(
                    (post) =>
                        post.skillLevel &&
                        post.skillLevel
                            .toLowerCase()
                            .includes(skillLevel.toLowerCase())
                );
            }

            // Filter by location
            if (location) {
                filteredPosts = filteredPosts.filter((post) =>
                    post.location.toLowerCase().includes(location.toLowerCase())
                );
            }

            // Pagination
            const start = page * size;
            const end = start + size;
            const paginatedPosts = filteredPosts.slice(start, end);

            const response: ApiResponse<PaginatedResponse<TeamPost>> = {
                success: true,
                message: "Tìm kiếm bài đăng thành công",
                data: {
                    content: paginatedPosts,
                    totalElements: filteredPosts.length,
                    totalPages: Math.ceil(filteredPosts.length / size),
                    size: size,
                    number: page,
                    numberOfElements: paginatedPosts.length,
                    first: page === 0,
                    last: end >= filteredPosts.length,
                    empty: paginatedPosts.length === 0,
                },
            };

            return response;
        } catch (error) {
            console.error("Search team posts error:", error);
            throw error;
        }
    }

    /**
     * Lấy thông tin chi tiết team post
     */
    async getTeamPostById(id: number): Promise<ApiResponse<TeamPost>> {
        try {
            const post = mockTeamPosts.find((p) => p.id === id);

            if (!post) {
                throw new Error(`Không tìm thấy bài đăng với ID ${id}`);
            }

            const response: ApiResponse<TeamPost> = {
                success: true,
                message: "Lấy thông tin bài đăng thành công",
                data: post,
            };

            return response;
        } catch (error) {
            console.error("Get team post by ID error:", error);
            throw error;
        }
    }

    /**
     * Tạo team post mới
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
     * Cập nhật team post
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
     * Xóa team post
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
     * Tham gia team
     */
    async joinTeam(postId: number): Promise<ApiResponse<void>> {
        try {
            return await apiClient.post<void>(`/team-posts/${postId}/join`);
        } catch (error) {
            console.error("Join team error:", error);
            throw error;
        }
    }

    /**
     * Rời khỏi team
     */
    async leaveTeam(postId: number): Promise<ApiResponse<void>> {
        try {
            return await apiClient.delete<void>(`/team-posts/${postId}/leave`);
        } catch (error) {
            console.error("Leave team error:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách thành viên team
     */
    async getTeamMembers(postId: number): Promise<ApiResponse<TeamMember[]>> {
        try {
            // Mock team members
            const mockMembers: TeamMember[] = [
                {
                    id: 1,
                    user: {
                        id: 1,
                        fullName: "Nguyễn Văn Hoàng",
                        email: "hoang@example.com",
                    },
                    status: "ACCEPTED",
                    joinedAt: "2024-01-15T10:30:00Z",
                },
                {
                    id: 2,
                    user: {
                        id: 2,
                        fullName: "Trần Thị Chi",
                        email: "chi@example.com",
                    },
                    status: "ACCEPTED",
                    joinedAt: "2024-01-15T11:00:00Z",
                },
            ];

            const response: ApiResponse<TeamMember[]> = {
                success: true,
                message: "Lấy danh sách thành viên thành công",
                data: mockMembers,
            };

            return response;
        } catch (error) {
            console.error("Get team members error:", error);
            throw error;
        }
    }

    /**
     * Chấp nhận thành viên (chỉ creator)
     */
    async acceptMember(
        postId: number,
        memberId: number
    ): Promise<ApiResponse<void>> {
        try {
            return await apiClient.post<void>(
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
     * Lấy team posts của tôi
     */
    async getMyTeamPosts(): Promise<ApiResponse<TeamPost[]>> {
        try {
            // Return some mock posts as "my posts"
            const myPosts = mockTeamPosts.slice(0, 2);

            const response: ApiResponse<TeamPost[]> = {
                success: true,
                message: "Lấy bài đăng của tôi thành công",
                data: myPosts,
            };

            return response;
        } catch (error) {
            console.error("Get my team posts error:", error);
            throw error;
        }
    }
}

// Export instance và helper functions
export const teamService = new TeamService();

export const getTeamPosts = (params?: { page?: number; size?: number }) =>
    teamService.getTeamPosts(params);

export const searchTeamPosts = (params: TeamPostSearchParams) =>
    teamService.searchTeamPosts(params);

export const getTeamPostById = (id: number) => teamService.getTeamPostById(id);

export const createTeamPost = (postData: CreateTeamPostRequest) =>
    teamService.createTeamPost(postData);

export const updateTeamPost = (
    id: number,
    postData: Partial<CreateTeamPostRequest>
) => teamService.updateTeamPost(id, postData);

export const deleteTeamPost = (id: number) => teamService.deleteTeamPost(id);

export const joinTeam = (postId: number) => teamService.joinTeam(postId);

export const leaveTeam = (postId: number) => teamService.leaveTeam(postId);

export const getTeamMembers = (postId: number) =>
    teamService.getTeamMembers(postId);

export const acceptMember = (postId: number, memberId: number) =>
    teamService.acceptMember(postId, memberId);

export const rejectMember = (postId: number, memberId: number) =>
    teamService.rejectMember(postId, memberId);

export const getMyTeamPosts = () => teamService.getMyTeamPosts();
