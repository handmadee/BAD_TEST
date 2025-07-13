package com.badminton.courtmanagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Bảng giá sân")
public class CourtPricingDto {
    
    @Schema(description = "ID bảng giá", example = "1")
    private Long id;
    
    @Schema(description = "ID sân", example = "1")
    private Long courtId;
    
    @Schema(description = "Ngày trong tuần (1=CN, 2=T2, ...)", example = "2")
    private Integer dayOfWeek;
    
    @Schema(description = "Thời gian bắt đầu", example = "06:00")
    private LocalTime startTime;
    
    @Schema(description = "Thời gian kết thúc", example = "18:00")
    private LocalTime endTime;
    
    @Schema(description = "Giá tiền (VNĐ)", example = "150000")
    private BigDecimal price;
    
    @Schema(description = "Loại giá (NORMAL, PEAK, WEEKEND)", example = "NORMAL")
    private String priceType;
    
    @Schema(description = "Mô tả", example = "Giá giờ bình thường")
    private String description;
} 