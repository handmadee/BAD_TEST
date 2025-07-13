package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.Booking;
import com.badminton.courtmanagement.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Management", description = "API quản lý đặt sân")
public class BookingController {
    
    private final BookingService bookingService;
    
    @PostMapping
    @Operation(summary = "Tạo booking mới", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<BookingDto> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        log.debug("Creating new booking for court: {}", request.getCourtId());
        BookingDto booking = bookingService.createBooking(request);
        return ApiResponse.success("Đặt sân thành công", booking);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin booking theo ID", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<BookingDto> getBookingById(
            @Parameter(description = "ID của booking") @PathVariable Long id) {
        
        log.debug("Getting booking by id: {}", id);
        BookingDto booking = bookingService.getBookingById(id);
        return ApiResponse.success(booking);
    }
    
    @GetMapping("/my-bookings")
    @Operation(summary = "Lấy danh sách booking của tôi", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<PageResponse<BookingDto>> getMyBookings(
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Getting my bookings");
        PageResponse<BookingDto> bookings = bookingService.getMyBookings(pageable);
        return ApiResponse.success(bookings);
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy booking theo user ID", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<BookingDto>> getBookingsByUser(
            @Parameter(description = "ID của user") @PathVariable Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Getting bookings by user id: {}", userId);
        PageResponse<BookingDto> bookings = bookingService.getBookingsByUser(userId, pageable);
        return ApiResponse.success(bookings);
    }
    
    @GetMapping("/court/{courtId}")
    @Operation(summary = "Lấy booking theo sân", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<PageResponse<BookingDto>> getBookingsByCourt(
            @Parameter(description = "ID của sân") @PathVariable Long courtId,
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Getting bookings by court id: {}", courtId);
        PageResponse<BookingDto> bookings = bookingService.getBookingsByCourt(courtId, pageable);
        return ApiResponse.success(bookings);
    }
    
    @GetMapping("/owner/{ownerId}")
    @Operation(summary = "Lấy booking theo chủ sân", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<PageResponse<BookingDto>> getBookingsByOwner(
            @Parameter(description = "ID chủ sân") @PathVariable Long ownerId,
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Getting bookings by owner id: {}", ownerId);
        PageResponse<BookingDto> bookings = bookingService.getBookingsByOwner(ownerId, pageable);
        return ApiResponse.success(bookings);
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái booking", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<BookingDto> updateBookingStatus(
            @Parameter(description = "ID của booking") @PathVariable Long id,
            @Parameter(description = "Trạng thái mới") @RequestParam Booking.BookingStatus status) {
        
        log.debug("Updating booking {} status to: {}", id, status);
        BookingDto booking = bookingService.updateBookingStatus(id, status);
        return ApiResponse.success("Cập nhật trạng thái booking thành công", booking);
    }
    
    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Hủy booking", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<BookingDto> cancelBooking(
            @Parameter(description = "ID của booking") @PathVariable Long id) {
        
        log.debug("Cancelling booking id: {}", id);
        BookingDto booking = bookingService.cancelBooking(id);
        return ApiResponse.success("Hủy booking thành công", booking);
    }
    
    @PatchMapping("/{id}/confirm")
    @Operation(summary = "Xác nhận booking", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<BookingDto> confirmBooking(
            @Parameter(description = "ID của booking") @PathVariable Long id) {
        
        log.debug("Confirming booking id: {}", id);
        BookingDto booking = bookingService.confirmBooking(id);
        return ApiResponse.success("Xác nhận booking thành công", booking);
    }
    
    @PatchMapping("/{id}/complete")
    @Operation(summary = "Hoàn thành booking", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<BookingDto> completeBooking(
            @Parameter(description = "ID của booking") @PathVariable Long id) {
        
        log.debug("Completing booking id: {}", id);
        BookingDto booking = bookingService.completeBooking(id);
        return ApiResponse.success("Hoàn thành booking thành công", booking);
    }
    
    @GetMapping("/upcoming/{userId}")
    @Operation(summary = "Lấy booking sắp tới", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ApiResponse<List<BookingDto>> getUpcomingBookings(
            @Parameter(description = "ID của user") @PathVariable Long userId) {
        
        log.debug("Getting upcoming bookings for user: {}", userId);
        List<BookingDto> bookings = bookingService.getUpcomingBookings(userId);
        return ApiResponse.success(bookings);
    }
    
    @GetMapping("/overdue")
    @Operation(summary = "Lấy booking quá hạn", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<BookingDto>> getOverdueBookings(
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.debug("Getting overdue bookings");
        PageResponse<BookingDto> bookings = bookingService.getOverdueBookings(pageable);
        return ApiResponse.success(bookings);
    }
    
    @GetMapping("/court/{courtId}/statistics")
    @Operation(summary = "Thống kê booking theo sân", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> getBookingStatistics(
            @Parameter(description = "ID của sân") @PathVariable Long courtId) {
        
        log.debug("Getting booking statistics for court: {}", courtId);
        Map<String, Object> statistics = bookingService.getBookingStatistics(courtId);
        return ApiResponse.success(statistics);
    }
    
    @GetMapping("/owner/{ownerId}/revenue")
    @Operation(summary = "Thống kê doanh thu", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<Map<String, Object>> getRevenueStatistics(
            @Parameter(description = "ID chủ sân") @PathVariable Long ownerId,
            @Parameter(description = "Ngày bắt đầu") @RequestParam 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "Ngày kết thúc") @RequestParam 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        log.debug("Getting revenue statistics for owner: {} from {} to {}", ownerId, startDate, endDate);
        Map<String, Object> statistics = bookingService.getRevenueStatistics(ownerId, startDate, endDate);
        return ApiResponse.success(statistics);
    }
} 