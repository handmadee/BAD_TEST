package com.badminton.courtmanagement.dto;

import com.badminton.courtmanagement.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response đăng nhập/đăng ký")
public class AuthResponse {

    @Schema(description = "JWT Access Token")
    private String accessToken;

    @Schema(description = "JWT Refresh Token")
    private String refreshToken;

    @Schema(description = "Loại token", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Thông tin người dùng")
    private UserInfo user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Thông tin người dùng")
    public static class UserInfo {
        @Schema(description = "ID người dùng")
        private Long id;

        @Schema(description = "Họ và tên")
        private String fullName;

        @Schema(description = "Email")
        private String email;

        @Schema(description = "Số điện thoại")
        private String phone;

        @Schema(description = "Vai trò")
        private User.UserRole role;

        @Schema(description = "Trạng thái")
        private User.UserStatus status;
    }
} 