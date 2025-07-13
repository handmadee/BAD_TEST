package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.AuthResponse;
import com.badminton.courtmanagement.dto.LoginRequest;
import com.badminton.courtmanagement.dto.RegisterRequest;
import com.badminton.courtmanagement.dto.UserDto;
import com.badminton.courtmanagement.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "API xác thực người dùng")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
            summary = "Đăng ký tài khoản mới",
            description = "Tạo tài khoản người dùng mới với thông tin cơ bản"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Đăng ký thành công",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dữ liệu đầu vào không hợp lệ",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Email hoặc số điện thoại đã tồn tại",
                    content = @Content
            )
    })
    public com.badminton.courtmanagement.dto.ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return com.badminton.courtmanagement.dto.ApiResponse.success("Đăng ký thành công", response);
    }

    @PostMapping("/login")
    @Operation(
            summary = "Đăng nhập",
            description = "Đăng nhập bằng email và mật khẩu"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Đăng nhập thành công",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Email hoặc mật khẩu không đúng",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dữ liệu đầu vào không hợp lệ",
                    content = @Content
            )
    })
    public com.badminton.courtmanagement.dto.ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return com.badminton.courtmanagement.dto.ApiResponse.success("Đăng nhập thành công", response);
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "Làm mới token",
            description = "Tạo access token mới từ refresh token"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Làm mới token thành công",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Refresh token không hợp lệ hoặc đã hết hạn",
                    content = @Content
            )
    })
    public com.badminton.courtmanagement.dto.ApiResponse<AuthResponse> refreshToken(
            @Parameter(description = "Refresh token", required = true)
            @RequestParam String refreshToken
    ) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return com.badminton.courtmanagement.dto.ApiResponse.success("Làm mới token thành công", response);
    }

    @GetMapping("/me")
    @Operation(
            summary = "Lấy thông tin người dùng hiện tại",
            description = "Lấy thông tin chi tiết của người dùng đang đăng nhập",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lấy thông tin thành công",
                    content = @Content(schema = @Schema(implementation = UserDto.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Chưa đăng nhập hoặc token không hợp lệ",
                    content = @Content
            )
    })
    public com.badminton.courtmanagement.dto.ApiResponse<UserDto> getCurrentUser() {
        UserDto user = authService.getCurrentUserProfile();
        return com.badminton.courtmanagement.dto.ApiResponse.success(user);
    }
} 