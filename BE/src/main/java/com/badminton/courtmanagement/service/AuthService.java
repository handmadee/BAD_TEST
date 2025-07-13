package com.badminton.courtmanagement.service;

import com.badminton.courtmanagement.dto.*;

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
} 