package com.badminton.courtmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request đổi mật khẩu")
public class ChangePasswordRequest {
    
    @Schema(description = "Mật khẩu hiện tại", example = "oldPassword123")
    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    private String currentPassword;
    
    @Schema(description = "Mật khẩu mới", example = "newPassword123")
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, max = 50, message = "Mật khẩu phải từ 6-50 ký tự")
    private String newPassword;
    
    @Schema(description = "Xác nhận mật khẩu mới", example = "newPassword123")
    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;
} 