package com.badminton.courtmanagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "API Response wrapper chuẩn")
public class ApiResponse<T> {
    
    @Schema(description = "Trạng thái thành công", example = "true")
    @Builder.Default
    private Boolean success = true;
    
    @Schema(description = "Thông điệp", example = "Thành công")
    private String message;
    
    @Schema(description = "Mã lỗi nếu có", example = "USER_NOT_FOUND")
    private String errorCode;
    
    @Schema(description = "Dữ liệu trả về")
    private T data;
    
    @Schema(description = "Thời gian response")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Schema(description = "Request ID để trace")
    private String requestId;
    
    // Static methods để tạo response nhanh
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Thành công")
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .build();
    }
} 