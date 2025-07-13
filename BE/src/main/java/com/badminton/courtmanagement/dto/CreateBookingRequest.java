package com.badminton.courtmanagement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request tạo mới đặt sân")
public class CreateBookingRequest {
    
    @NotNull(message = "ID sân không được để trống")
    @Schema(description = "ID sân", example = "1", required = true)
    private Long courtId;
    
    @NotNull(message = "Ngày đặt sân không được để trống")
    @Future(message = "Ngày đặt sân phải là tương lai")
    @Schema(description = "Ngày đặt sân", example = "2024-01-15", required = true)
    private LocalDate bookingDate;
    
    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Schema(description = "Thời gian bắt đầu", example = "09:00", required = true)
    private LocalTime startTime;
    
    @NotNull(message = "Thời gian kết thúc không được để trống")
    @Schema(description = "Thời gian kết thúc", example = "11:00", required = true)
    private LocalTime endTime;
    
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    @Schema(description = "Ghi chú")
    private String notes;
    
    @Schema(description = "Danh sách mã giảm giá")
    private List<String> discountCodes;
} 