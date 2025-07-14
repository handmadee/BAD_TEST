package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.User;
import com.badminton.courtmanagement.service.CourtService;
import com.badminton.courtmanagement.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "API quản lý admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final CourtService courtService;
    private final AuthService authService;

    // =========================== DASHBOARD STATS ===========================
    
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Lấy thống kê tổng quan", description = "Lấy thống kê dashboard cho admin")
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = Map.of(
            "totalCourts", 25,
            "activeCourts", 22,
            "totalUsers", 150,
            "totalBookings", 340,
            "monthlyRevenue", 15000000,
            "popularSports", List.of(
                Map.of("name", "Cầu lông", "count", 18),
                Map.of("name", "Pickleball", "count", 7)
            )
        );
        return ApiResponse.success(stats);
    }

    // =========================== COURT MANAGEMENT ===========================
    
    @GetMapping("/courts")
    @Operation(summary = "Lấy danh sách tất cả sân", description = "Admin xem danh sách tất cả sân trong hệ thống")
    public ApiResponse<PageResponse<CourtDto>> getAllCourts(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String keyword,
            @Parameter(description = "Trạng thái sân") @RequestParam(required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        
        // For now, use the existing searchCourts method
        PageResponse<CourtDto> courts = courtService.searchCourts(
            keyword, null, null, null, null, null, pageable);
        return ApiResponse.success(courts);
    }

    @PostMapping("/courts")
    @Operation(summary = "Tạo sân mới", description = "Admin tạo sân mới trong hệ thống")
    public ApiResponse<CourtDto> createCourt(@Valid @RequestBody CreateCourtRequest request) {
        CourtDto court = courtService.createCourtAsAdmin(request);
        return ApiResponse.success(court);
    }

    @PutMapping("/courts/{id}")
    @Operation(summary = "Cập nhật thông tin sân", description = "Admin cập nhật thông tin sân")
    public ApiResponse<CourtDto> updateCourt(
            @Parameter(description = "ID của sân") @PathVariable Long id,
            @Valid @RequestBody CreateCourtRequest request) {
        CourtDto court = courtService.updateCourt(id, request);
        return ApiResponse.success(court);
    }

    @DeleteMapping("/courts/{id}")
    @Operation(summary = "Xóa sân", description = "Admin xóa sân khỏi hệ thống")
    public ApiResponse<Void> deleteCourt(@Parameter(description = "ID của sân") @PathVariable Long id) {
        courtService.deleteCourt(id);
        return ApiResponse.success(null);
    }

    // =========================== COURT OWNER MANAGEMENT ===========================
    
    @PostMapping("/court-owners")
    @Operation(summary = "Tạo tài khoản chủ sân", description = "Admin tạo tài khoản cho chủ sân")
    public ApiResponse<UserDto> createCourtOwner(@Valid @RequestBody CreateCourtOwnerRequest request) {
        // Create user with COURT_OWNER role
        RegisterRequest registerRequest = RegisterRequest.builder()
            .username(request.getUsername())
            .fullName(request.getFullName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .password(request.getPassword())
            .confirmPassword(request.getPassword())
            .build();
            
        UserDto user = authService.registerCourtOwner(registerRequest);
        return ApiResponse.success(user);
    }

    @GetMapping("/court-owners")
    @Operation(summary = "Lấy danh sách chủ sân", description = "Admin xem danh sách tất cả chủ sân")
    public ApiResponse<PageResponse<UserDto>> getCourtOwners(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        
        // This will need to be implemented in AuthService
        PageResponse<UserDto> owners = authService.getCourtOwners(keyword, pageable);
        return ApiResponse.success(owners);
    }

    // =========================== USER MANAGEMENT ===========================
    
    @GetMapping("/users")
    @Operation(summary = "Lấy danh sách người dùng", description = "Admin xem danh sách tất cả người dùng")
    public ApiResponse<PageResponse<UserDto>> getAllUsers(
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String keyword,
            @Parameter(description = "Vai trò") @RequestParam(required = false) String role,
            @PageableDefault(size = 20) Pageable pageable) {
        
        PageResponse<UserDto> users = authService.getAllUsers(keyword, role, pageable);
        return ApiResponse.success(users);
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Cập nhật trạng thái người dùng", description = "Admin kích hoạt/vô hiệu hóa tài khoản")
    public ApiResponse<UserDto> updateUserStatus(
            @Parameter(description = "ID người dùng") @PathVariable Long id,
            @Parameter(description = "Trạng thái mới") @RequestParam String status) {
        
        UserDto user = authService.updateUserStatus(id, User.UserStatus.valueOf(status));
        return ApiResponse.success(user);
    }
} 