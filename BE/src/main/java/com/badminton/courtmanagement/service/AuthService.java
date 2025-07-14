package com.badminton.courtmanagement.service;

import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.User;
import org.springframework.data.domain.Pageable;

public interface AuthService {
    
    /**
     * Đăng ký user mới
     */
    AuthResponse register(RegisterRequest request);
    
    /**
     * Đăng nhập
     */
    AuthResponse login(LoginRequest request);
    
    /**
     * Refresh token
     */
    AuthResponse refreshToken(String refreshToken);
    
    /**
     * Lấy thông tin profile user hiện tại
     */
    UserDto getCurrentUserProfile();
    
    /**
     * Cập nhật profile user
     */
    UserDto updateProfile(UpdateProfileRequest request);
    
    /**
     * Đổi mật khẩu
     */
    void changePassword(ChangePasswordRequest request);
    
    /**
     * Lấy thông tin user theo ID
     */
    UserDto getUserById(Long userId);
    
    // ================= ADMIN METHODS =================
    
    /**
     * Đăng ký court owner (chỉ admin)
     */
    UserDto registerCourtOwner(RegisterRequest request);
    
    /**
     * Lấy danh sách court owners (admin)
     */
    PageResponse<UserDto> getCourtOwners(String keyword, Pageable pageable);
    
    /**
     * Lấy danh sách tất cả users (admin)
     */
    PageResponse<UserDto> getAllUsers(String keyword, String role, Pageable pageable);
    
    /**
     * Cập nhật trạng thái user (admin)
     */
    UserDto updateUserStatus(Long userId, User.UserStatus status);
} 