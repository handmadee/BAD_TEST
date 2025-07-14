package com.badminton.courtmanagement.dto;

import com.badminton.courtmanagement.entity.Court;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Thông tin sân cầu lông")
public class CourtDto {
    
    @Schema(description = "ID sân", example = "1")
    private Long id;
    
    @Schema(description = "Thông tin chủ sân")
    private CourtOwnerDto owner;
    
    @Schema(description = "Tên sân", example = "Sân cầu lông ABC")
    private String name;
    
    @Schema(description = "Địa chỉ", example = "123 Đường ABC, Quận 1, TP.HCM")
    private String address;
    
    @Schema(description = "Mô tả sân")
    private String description;
    
    @Schema(description = "Số điện thoại", example = "0123456789")
    private String phone;
    
    @Schema(description = "Email liên hệ", example = "contact@court.com")
    private String email;
    
    @Schema(description = "Facebook URL")
    private String facebookUrl;
    
    @Schema(description = "Giờ hoạt động", example = "06:00 - 23:00")
    private String operatingHours;
    
    @Schema(description = "Loại thể thao", example = "Cầu lông, Pickleball")
    private String sportTypes;
    
    @Schema(description = "Tiện ích")
    private String amenities;
    
    @Schema(description = "Hình ảnh sân")
    private List<String> images;
    
    @Schema(description = "Vĩ độ", example = "10.762622")
    private BigDecimal latitude;
    
    @Schema(description = "Kinh độ", example = "106.660172")
    private BigDecimal longitude;
    
    @Schema(description = "Đánh giá trung bình", example = "4.5")
    private BigDecimal averageRating;
    
    @Schema(description = "Tổng số đánh giá", example = "150")
    private Integer totalReviews;
    
    @Schema(description = "Trạng thái sân")
    private Court.CourtStatus status;
    
    @Schema(description = "Bảng giá sân")
    private List<CourtPricingDto> pricings;
    
    @Schema(description = "Khoảng cách từ vị trí hiện tại (km)", example = "2.5")
    private Double distance;
    
    @Schema(description = "Giá khởi điểm (VND/giờ)", example = "80000")
    private BigDecimal price;
    
    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;
    
    @Schema(description = "Thời gian cập nhật")
    private LocalDateTime updatedAt;
} 