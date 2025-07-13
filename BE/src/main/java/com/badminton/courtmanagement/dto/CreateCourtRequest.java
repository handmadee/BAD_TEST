package com.badminton.courtmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request tạo mới sân")
public class CreateCourtRequest {
    
    @NotBlank(message = "Tên sân không được để trống")
    @Size(max = 200, message = "Tên sân không được vượt quá 200 ký tự")
    @Schema(description = "Tên sân", example = "Sân cầu lông ABC", required = true)
    private String name;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    @Schema(description = "Địa chỉ sân", example = "123 Đường ABC, Quận 1, TP.HCM", required = true)
    private String address;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    @Schema(description = "Mô tả sân")
    private String description;
    
    @Pattern(regexp = "^(\\+84|0)[0-9]{9,10}$", message = "Số điện thoại không hợp lệ")
    @Schema(description = "Số điện thoại", example = "0123456789")
    private String phone;
    
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    @Schema(description = "Email liên hệ", example = "contact@court.com")
    private String email;
    
    @Schema(description = "Facebook URL")
    private String facebookUrl;
    
    @Size(max = 100, message = "Giờ hoạt động không được vượt quá 100 ký tự")
    @Schema(description = "Giờ hoạt động", example = "06:00 - 23:00")
    private String operatingHours;
    
    @Size(max = 100, message = "Loại thể thao không được vượt quá 100 ký tự")
    @Schema(description = "Loại thể thao", example = "Cầu lông, Pickleball")
    private String sportTypes;
    
    @Schema(description = "Tiện ích")
    private String amenities;
    
    @Schema(description = "Danh sách URL hình ảnh")
    private List<String> images;
    
    @NotNull(message = "Vĩ độ không được để trống")
    @DecimalMin(value = "-90.0", message = "Vĩ độ phải >= -90")
    @DecimalMax(value = "90.0", message = "Vĩ độ phải <= 90")
    @Schema(description = "Vĩ độ", example = "10.762622", required = true)
    private BigDecimal latitude;
    
    @NotNull(message = "Kinh độ không được để trống")
    @DecimalMin(value = "-180.0", message = "Kinh độ phải >= -180")
    @DecimalMax(value = "180.0", message = "Kinh độ phải <= 180")
    @Schema(description = "Kinh độ", example = "106.660172", required = true)
    private BigDecimal longitude;
    
    @Schema(description = "Danh sách bảng giá")
    private List<CreateCourtPricingRequest> pricings;
} 