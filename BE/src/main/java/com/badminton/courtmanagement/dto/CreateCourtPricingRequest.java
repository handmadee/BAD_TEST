package com.badminton.courtmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request tạo mới bảng giá sân")
public class CreateCourtPricingRequest {
    
    @NotNull(message = "Ngày trong tuần không được để trống")
    @Min(value = 1, message = "Ngày trong tuần phải từ 1-7 (1=CN)")
    @Max(value = 7, message = "Ngày trong tuần phải từ 1-7 (7=T7)")
    @Schema(description = "Ngày trong tuần (1=CN, 2=T2, ...)", example = "2", required = true)
    private Integer dayOfWeek;
    
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Schema(description = "Thời gian bắt đầu", example = "06:00", required = true)
    private LocalTime startTime;
    
    @NotNull(message = "Thời gian kết thúc không được để trống")
    @Schema(description = "Thời gian kết thúc", example = "18:00", required = true)
    private LocalTime endTime;
    
    @NotNull(message = "Giá tiền không được để trống")
    @DecimalMin(value = "0.0", message = "Giá tiền phải >= 0")
    @Schema(description = "Giá tiền (VNĐ)", example = "150000", required = true)
    private BigDecimal price;
    
    @Size(max = 50, message = "Loại giá không được vượt quá 50 ký tự")
    @Schema(description = "Loại giá", example = "NORMAL")
    private String priceType;
    
    @Size(max = 200, message = "Mô tả không được vượt quá 200 ký tự")
    @Schema(description = "Mô tả", example = "Giá giờ bình thường")
    private String description;
} 