package com.badminton.courtmanagement.service;

import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.Booking;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface BookingService {
    
    /**
     * Tạo booking mới
     */
    BookingDto createBooking(CreateBookingRequest request);
    
    /**
     * Lấy thông tin booking theo ID
     */
    BookingDto getBookingById(Long bookingId);
    
    /**
     * Lấy danh sách booking của user hiện tại
     */
    PageResponse<BookingDto> getMyBookings(Pageable pageable);
    
    /**
     * Lấy danh sách booking theo user ID
     */
    PageResponse<BookingDto> getBookingsByUser(Long userId, Pageable pageable);
    
    /**
     * Lấy danh sách booking theo sân
     */
    PageResponse<BookingDto> getBookingsByCourt(Long courtId, Pageable pageable);
    
    /**
     * Lấy danh sách booking theo chủ sân
     */
    PageResponse<BookingDto> getBookingsByOwner(Long ownerId, Pageable pageable);
    
    /**
     * Cập nhật trạng thái booking
     */
    BookingDto updateBookingStatus(Long bookingId, Booking.BookingStatus status);
    
    /**
     * Hủy booking
     */
    BookingDto cancelBooking(Long bookingId);
    
    /**
     * Xác nhận booking
     */
    BookingDto confirmBooking(Long bookingId);
    
    /**
     * Hoàn thành booking
     */
    BookingDto completeBooking(Long bookingId);
    
    /**
     * Lấy booking sắp tới của user
     */
    List<BookingDto> getUpcomingBookings(Long userId);
    
    /**
     * Lấy booking quá hạn
     */
    PageResponse<BookingDto> getOverdueBookings(Pageable pageable);
    
    /**
     * Thống kê booking
     */
    Map<String, Object> getBookingStatistics(Long courtId);
    
    /**
     * Thống kê doanh thu
     */
    Map<String, Object> getRevenueStatistics(Long ownerId, LocalDateTime startDate, LocalDateTime endDate);
} 