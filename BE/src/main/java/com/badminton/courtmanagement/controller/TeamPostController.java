package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.TeamPost;
import com.badminton.courtmanagement.service.TeamPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team-posts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Team Post Management", description = "API quản lý bài đăng tìm đội")
public class TeamPostController {
    
    private final TeamPostService teamPostService;
    
    @PostMapping
    @Operation(summary = "Tạo bài đăng tìm đội mới", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamPostDto> createTeamPost(@Valid @RequestBody CreateTeamPostRequest request) {
        log.debug("Creating new team post: {}", request.getTitle());
        TeamPostDto teamPost = teamPostService.createTeamPost(request);
        return ApiResponse.success("Tạo bài đăng thành công", teamPost);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin bài đăng theo ID")
    public ApiResponse<TeamPostDto> getTeamPostById(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id) {
        
        log.debug("Getting team post by id: {}", id);
        TeamPostDto teamPost = teamPostService.getTeamPostById(id);
        return ApiResponse.success(teamPost);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật bài đăng", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamPostDto> updateTeamPost(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id,
            @Valid @RequestBody CreateTeamPostRequest request) {
        
        log.debug("Updating team post id: {}", id);
        TeamPostDto teamPost = teamPostService.updateTeamPost(id, request);
        return ApiResponse.success("Cập nhật bài đăng thành công", teamPost);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa bài đăng", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteTeamPost(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id) {
        
        log.debug("Deleting team post id: {}", id);
        teamPostService.deleteTeamPost(id);
        return ApiResponse.<Void>success("Xóa bài đăng thành công", null);
    }
    
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả bài đăng", description = "Lấy danh sách bài đăng với phân trang")
    public ApiResponse<PageResponse<TeamPostDto>> getAllTeamPosts(
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Getting all team posts with pagination: {}", pageable);
        PageResponse<TeamPostDto> teamPosts = teamPostService.getAllTeamPosts(pageable);
        return ApiResponse.success(teamPosts);
    }
    
    @GetMapping("/joined-teams")
    @Operation(summary = "Lấy danh sách đội đã tham gia", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<PageResponse<TeamPostDto>> getJoinedTeams(
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Getting joined teams");
        PageResponse<TeamPostDto> teamPosts = teamPostService.getJoinedTeams(pageable);
        return ApiResponse.success(teamPosts);
    }

    @GetMapping("/my-posts")
    @Operation(summary = "Lấy danh sách bài đăng của tôi", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<PageResponse<TeamPostDto>> getMyTeamPosts(
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Getting my team posts");
        PageResponse<TeamPostDto> teamPosts = teamPostService.getMyTeamPosts(pageable);
        return ApiResponse.success(teamPosts);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm bài đăng", description = "Tìm kiếm bài đăng theo từ khóa và bộ lọc")
    public ApiResponse<PageResponse<TeamPostDto>> searchTeamPosts(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String keyword,
            @Parameter(description = "Môn thể thao") @RequestParam(required = false) String sport,
            @Parameter(description = "Trình độ") @RequestParam(required = false) String skillLevel,
            @Parameter(description = "Địa điểm") @RequestParam(required = false) String location,
            @Parameter(description = "Ngày chơi (yyyy-MM-dd)") @RequestParam(required = false) String date,
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Searching team posts with keyword: {}", keyword);
        PageResponse<TeamPostDto> teamPosts = teamPostService.searchTeamPosts(
                keyword, sport, skillLevel, location, date, pageable);
        return ApiResponse.success(teamPosts);
    }
    
    @PostMapping("/{id}/join")
    @Operation(summary = "Tham gia đội", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamMemberDto> joinTeamPost(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id) {
        
        log.debug("User joining team post id: {}", id);
        TeamMemberDto teamMember = teamPostService.joinTeamPost(id);
        return ApiResponse.success("Đã gửi yêu cầu tham gia đội", teamMember);
    }
    
    @PostMapping("/{id}/message-and-join")
    @Operation(summary = "Gửi tin nhắn và yêu cầu tham gia đội", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamMemberDto> sendMessageAndJoinRequest(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id,
            @Parameter(description = "Nội dung tin nhắn") @RequestParam String message) {
        
        log.debug("User sending message and join request for team post id: {}", id);
        TeamMemberDto teamMember = teamPostService.sendMessageAndJoinRequest(id, message);
        return ApiResponse.success("Đã gửi tin nhắn và yêu cầu tham gia đội", teamMember);
    }
    
    @PostMapping("/{id}/leave")
    @Operation(summary = "Rời khỏi đội", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamMemberDto> leaveTeamPost(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id) {
        
        log.debug("User leaving team post id: {}", id);
        TeamMemberDto teamMember = teamPostService.leaveTeamPost(id);
        return ApiResponse.success("Đã rời khỏi đội", teamMember);
    }
    
    @PostMapping("/{teamPostId}/members/{memberId}/accept")
    @Operation(summary = "Chấp nhận thành viên", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamMemberDto> acceptMember(
            @Parameter(description = "ID của bài đăng") @PathVariable Long teamPostId,
            @Parameter(description = "ID của thành viên") @PathVariable Long memberId) {
        
        log.debug("Accepting member {} for team post {}", memberId, teamPostId);
        TeamMemberDto teamMember = teamPostService.acceptMember(teamPostId, memberId);
        return ApiResponse.success("Đã chấp nhận thành viên", teamMember);
    }
    
    @PostMapping("/{teamPostId}/members/{memberId}/reject")
    @Operation(summary = "Từ chối thành viên", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamMemberDto> rejectMember(
            @Parameter(description = "ID của bài đăng") @PathVariable Long teamPostId,
            @Parameter(description = "ID của thành viên") @PathVariable Long memberId) {
        
        log.debug("Rejecting member {} for team post {}", memberId, teamPostId);
        TeamMemberDto teamMember = teamPostService.rejectMember(teamPostId, memberId);
        return ApiResponse.success("Đã từ chối thành viên", teamMember);
    }
    
    @GetMapping("/{id}/members")
    @Operation(summary = "Lấy danh sách thành viên")
    public ApiResponse<List<TeamMemberDto>> getTeamMembers(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id) {
        
        log.debug("Getting team members for team post: {}", id);
        List<TeamMemberDto> members = teamPostService.getTeamMembers(id);
        return ApiResponse.success(members);
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái bài đăng", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamPostDto> updateTeamPostStatus(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id,
            @Parameter(description = "Trạng thái mới") @RequestParam TeamPost.PostStatus status) {
        
        log.debug("Updating team post {} status to: {}", id, status);
        TeamPostDto teamPost = teamPostService.updateTeamPostStatus(id, status);
        return ApiResponse.success("Cập nhật trạng thái thành công", teamPost);
    }
    
    @PatchMapping("/{id}/close")
    @Operation(summary = "Đóng bài đăng", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamPostDto> closeTeamPost(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id) {
        
        log.debug("Closing team post id: {}", id);
        TeamPostDto teamPost = teamPostService.closeTeamPost(id);
        return ApiResponse.success("Đã đóng bài đăng", teamPost);
    }
    
    @PatchMapping("/{id}/reopen")
    @Operation(summary = "Mở lại bài đăng", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<TeamPostDto> reopenTeamPost(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id) {
        
        log.debug("Reopening team post id: {}", id);
        TeamPostDto teamPost = teamPostService.reopenTeamPost(id);
        return ApiResponse.success("Đã mở lại bài đăng", teamPost);
    }
    
    @GetMapping("/upcoming/{userId}")
    @Operation(summary = "Lấy bài đăng sắp tới của user")
    public ApiResponse<List<TeamPostDto>> getUpcomingTeamPosts(
            @Parameter(description = "ID của user") @PathVariable Long userId) {
        
        log.debug("Getting upcoming team posts for user: {}", userId);
        List<TeamPostDto> teamPosts = teamPostService.getUpcomingTeamPosts(userId);
        return ApiResponse.success(teamPosts);
    }
    
    @GetMapping("/popular")
    @Operation(summary = "Lấy bài đăng phổ biến")
    public ApiResponse<List<TeamPostDto>> getPopularTeamPosts(
            @Parameter(description = "Số lượng bài đăng") @RequestParam(defaultValue = "10") int limit) {
        
        log.debug("Getting popular team posts with limit: {}", limit);
        List<TeamPostDto> teamPosts = teamPostService.getPopularTeamPosts(limit);
        return ApiResponse.success(teamPosts);
    }
    
    @GetMapping("/user/{userId}/statistics")
    @Operation(summary = "Thống kê bài đăng của user", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> getTeamPostStatistics(
            @Parameter(description = "ID của user") @PathVariable Long userId) {
        
        log.debug("Getting team post statistics for user: {}", userId);
        Map<String, Object> statistics = teamPostService.getTeamPostStatistics(userId);
        return ApiResponse.success(statistics);
    }
    
    @GetMapping("/{id}/can-join")
    @Operation(summary = "Kiểm tra có thể tham gia đội không")
    public ApiResponse<Boolean> canUserJoinTeam(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id,
            @Parameter(description = "ID của user") @RequestParam Long userId) {
        
        log.debug("Checking if user {} can join team post {}", userId, id);
        boolean canJoin = teamPostService.canUserJoinTeam(id, userId);
        return ApiResponse.success(canJoin);
    }
    
    @GetMapping("/{id}/is-full")
    @Operation(summary = "Kiểm tra đội đã đủ người chưa")
    public ApiResponse<Boolean> isTeamPostFull(
            @Parameter(description = "ID của bài đăng") @PathVariable Long id) {
        
        log.debug("Checking if team post {} is full", id);
        boolean isFull = teamPostService.isTeamPostFull(id);
        return ApiResponse.success(isFull);
    }
} 