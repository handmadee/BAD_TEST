package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "API quản lý người dùng")
public class UserController {
    
    private final AuthService authService;
    
    @GetMapping("/profile")
    @Operation(summary = "Lấy thông tin profile hiện tại", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<UserDto> getCurrentUserProfile() {
        log.debug("Getting current user profile");
        UserDto user = authService.getCurrentUserProfile();
        return ApiResponse.success(user);
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Cập nhật profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        log.debug("Updating user profile");
        UserDto user = authService.updateProfile(request);
        return ApiResponse.success("Cập nhật profile thành công", user);
    }
    
    @PostMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        log.debug("Changing user password");
        authService.changePassword(request);
        return ApiResponse.<Void>success("Đổi mật khẩu thành công", null);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin user theo ID", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserDto> getUserById(
            @Parameter(description = "ID của user") @PathVariable Long id) {
        
        log.debug("Getting user by id: {}", id);
        UserDto user = authService.getUserById(id);
        return ApiResponse.success(user);
    }
} 