package com.badminton.courtmanagement.service;

import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.Court;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface CourtService {
    
    /**
     * Tạo mới sân
     */
    CourtDto createCourt(CreateCourtRequest request);
    
    /**
     * Tạo mới sân bởi admin (không cần court owner)
     */
    CourtDto createCourtAsAdmin(CreateCourtRequest request);
    
    /**
     * Cập nhật thông tin sân
     */
    CourtDto updateCourt(Long courtId, CreateCourtRequest request);
    
    /**
     * Lấy thông tin sân theo ID
     */
    CourtDto getCourtById(Long courtId);
    
    /**
     * Lấy danh sách tất cả sân (có phân trang)
     */
    PageResponse<CourtDto> getAllCourts(Pageable pageable);
    
    /**
     * Tìm kiếm sân theo từ khóa
     */
    PageResponse<CourtDto> searchCourts(String keyword, 
                                       String sportType,
                                       BigDecimal minRating,
                                       BigDecimal latitude,
                                       BigDecimal longitude,
                                       Double radiusKm,
                                       Pageable pageable);
    
    /**
     * Tìm sân theo chủ sân
     */
    PageResponse<CourtDto> getCourtsByOwner(Long ownerId, Pageable pageable);
    
    /**
     * Tìm sân trong bán kính
     */
    List<CourtDto> getNearbyCourtsByRadius(BigDecimal latitude, 
                                        BigDecimal longitude, 
                                        Double radiusKm);
    
    /**
     * Lấy sân của tôi (owner hiện tại)
     */
    PageResponse<CourtDto> getMyOwnedCourts(Pageable pageable);
    
    /**
     * Xóa sân (soft delete - chuyển status thành INACTIVE)
     */
    void deleteCourt(Long courtId);
    
    /**
     * Cập nhật trạng thái sân
     */
    CourtDto updateCourtStatus(Long courtId, Court.CourtStatus status);
    
    /**
     * Thống kê sân
     */
    Map<String, Object> getCourtStatistics(Long courtId);
    
    /**
     * Thống kê chủ sân
     */
    Map<String, Object> getOwnerStatistics(Long ownerId);
    
    /**
     * Kiểm tra sân có available không
     */
    boolean isCourtAvailable(Long courtId, LocalDateTime startTime, LocalDateTime endTime);
} 