package com.badminton.courtmanagement.dto;

import com.badminton.courtmanagement.entity.Booking;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Thông tin đặt sân")
public class BookingDto {
    
    @Schema(description = "ID đặt sân", example = "1")
    private Long id;
    
    @Schema(description = "Thông tin người đặt")
    private UserDto user;
    
    @Schema(description = "Thông tin sân")
    private CourtDto court;
    
    @Schema(description = "Ngày đặt sân", example = "2024-01-15")
    private LocalDate bookingDate;
    
    @Schema(description = "Thời gian bắt đầu", example = "09:00")
    private LocalTime startTime;
    
    @Schema(description = "Thời gian kết thúc", example = "11:00")
    private LocalTime endTime;
    
    @Schema(description = "Tổng tiền", example = "300000")
    private BigDecimal totalAmount;
    
    @Schema(description = "Trạng thái đặt sân")
    private Booking.BookingStatus status;
    
    @Schema(description = "URL VietQR")
    private String vietqrUrl;
    
    @Schema(description = "Ghi chú")
    private String notes;
    
    @Schema(description = "Mã tham chiếu booking", example = "BK1705123456ABC")
    private String bookingReference;
    
    @Schema(description = "Thời gian tạo")
    private LocalDateTime createdAt;
    
    @Schema(description = "Thời gian cập nhật")
    private LocalDateTime updatedAt;
} 