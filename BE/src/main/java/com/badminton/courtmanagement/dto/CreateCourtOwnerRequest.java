package com.badminton.courtmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
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
@Schema(description = "Request tạo tài khoản chủ sân")
public class CreateCourtOwnerRequest {

    @Schema(description = "Tên đăng nhập", example = "courtowner1")
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3-50 ký tự")
    private String username;

    @Schema(description = "Họ và tên", example = "Nguyễn Văn A")
    @NotBlank(message = "Họ và tên không được để trống")
    private String fullName;

    @Schema(description = "Email", example = "owner@example.com")
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @Schema(description = "Số điện thoại", example = "0123456789")
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    @Schema(description = "Mật khẩu", example = "password123")
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @Schema(description = "Địa chỉ", example = "123 Đường ABC, Quận 1, TP.HCM")
    private String address;

    @Schema(description = "Mô tả", example = "Chủ sở hữu sân cầu lông chuyên nghiệp")
    private String description;
} 