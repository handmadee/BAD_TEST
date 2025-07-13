package com.badminton.courtmanagement.repository;

import com.badminton.courtmanagement.entity.Booking;
import com.badminton.courtmanagement.entity.Court;
import com.badminton.courtmanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    
    /**
     * Tìm booking theo user
     */
    Page<Booking> findByUser(User user, Pageable pageable);
    
    /**
     * Tìm booking theo user và trạng thái
     */
    Page<Booking> findByUserAndStatus(User user, Booking.BookingStatus status, Pageable pageable);
    
    /**
     * Tìm booking theo sân
     */
    Page<Booking> findByCourt(Court court, Pageable pageable);
    
    /**
     * Tìm booking theo sân và trạng thái
     */
    Page<Booking> findByCourtAndStatus(Court court, Booking.BookingStatus status, Pageable pageable);
    
    /**
     * Tìm booking theo ngày
     */
    Page<Booking> findByBookingDate(LocalDate bookingDate, Pageable pageable);
    
    /**
     * Tìm booking theo ngày và trạng thái
     */
    Page<Booking> findByBookingDateAndStatus(LocalDate bookingDate, Booking.BookingStatus status, Pageable pageable);
    
    /**
     * Tìm booking theo khoảng ngày
     */
    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    Page<Booking> findByBookingDateBetween(@Param("startDate") LocalDate startDate, 
                                          @Param("endDate") LocalDate endDate, 
                                          Pageable pageable);
    
    /**
     * Kiểm tra xung đột thời gian đặt sân
     */
    @Query("""
        SELECT COUNT(b) FROM Booking b 
        WHERE b.court = :court 
        AND b.bookingDate = :bookingDate 
        AND b.status IN ('PENDING', 'CONFIRMED') 
        AND ((b.startTime < :endTime AND b.endTime > :startTime))
        """)
    long countConflictingBookings(@Param("court") Court court,
                                 @Param("bookingDate") LocalDate bookingDate,
                                 @Param("startTime") LocalTime startTime,
                                 @Param("endTime") LocalTime endTime);
    
    /**
     * Kiểm tra xung đột thời gian đặt sân (loại trừ booking hiện tại)
     */
    @Query("""
        SELECT COUNT(b) FROM Booking b 
        WHERE b.court = :court 
        AND b.bookingDate = :bookingDate 
        AND b.id != :excludeBookingId
        AND b.status IN ('PENDING', 'CONFIRMED') 
        AND ((b.startTime < :endTime AND b.endTime > :startTime))
        """)
    long countConflictingBookingsExcluding(@Param("court") Court court,
                                          @Param("bookingDate") LocalDate bookingDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("excludeBookingId") Long excludeBookingId);
    
    /**
     * Tìm booking theo sân và ngày
     */
    @Query("SELECT b FROM Booking b WHERE b.court = :court AND b.bookingDate = :bookingDate ORDER BY b.startTime")
    List<Booking> findByCourtAndBookingDateOrderByStartTime(@Param("court") Court court, 
                                                           @Param("bookingDate") LocalDate bookingDate);
    
    /**
     * Tìm booking đã hoàn thành của user cho sân cụ thể
     */
    @Query("""
        SELECT COUNT(b) FROM Booking b 
        WHERE b.user = :user 
        AND b.court = :court 
        AND b.status = 'COMPLETED'
        """)
    long countCompletedBookingsByUserAndCourt(@Param("user") User user, @Param("court") Court court);
    
    /**
     * Tìm booking sắp diễn ra (trong 24h tới)
     */
    @Query("""
        SELECT b FROM Booking b 
        WHERE b.status = 'CONFIRMED' 
        AND b.bookingDate = :today 
        AND b.startTime BETWEEN :currentTime AND :endTime
        ORDER BY b.startTime
        """)
    List<Booking> findUpcomingBookings(@Param("today") LocalDate today,
                                      @Param("currentTime") LocalTime currentTime,
                                      @Param("endTime") LocalTime endTime);
    
    /**
     * Tìm booking quá hạn (chưa thanh toán)
     */
    @Query("""
        SELECT b FROM Booking b 
        WHERE b.status = 'PENDING' 
        AND b.createdAt < :cutoffTime
        """)
    List<Booking> findOverdueBookings(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Đếm booking theo trạng thái
     */
    long countByStatus(Booking.BookingStatus status);
    
    /**
     * Đếm booking theo user và trạng thái
     */
    long countByUserAndStatus(User user, Booking.BookingStatus status);
    
    /**
     * Đếm booking theo sân và trạng thái
     */
    long countByCourtAndStatus(Court court, Booking.BookingStatus status);
    
    /**
     * Tìm booking theo user trong khoảng thời gian
     */
    @Query("""
        SELECT b FROM Booking b 
        WHERE b.user = :user 
        AND b.bookingDate BETWEEN :startDate AND :endDate 
        ORDER BY b.bookingDate DESC, b.startTime DESC
        """)
    Page<Booking> findByUserAndDateRange(@Param("user") User user,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate,
                                        Pageable pageable);
    
    /**
     * Tìm booking theo chủ sân trong khoảng thời gian
     */
    @Query("""
        SELECT b FROM Booking b 
        WHERE b.court.owner.id = :ownerId 
        AND b.bookingDate BETWEEN :startDate AND :endDate 
        ORDER BY b.bookingDate DESC, b.startTime DESC
        """)
    Page<Booking> findByCourtOwnerAndDateRange(@Param("ownerId") Long ownerId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate,
                                              Pageable pageable);
    
    /**
     * Thống kê doanh thu theo sân trong khoảng thời gian
     */
    @Query("""
        SELECT b.court.id, b.court.name, SUM(b.totalAmount) 
        FROM Booking b 
        WHERE b.status IN ('CONFIRMED', 'COMPLETED') 
        AND b.bookingDate BETWEEN :startDate AND :endDate 
        GROUP BY b.court.id, b.court.name 
        ORDER BY SUM(b.totalAmount) DESC
        """)
    List<Object[]> getRevenueStatsByCourt(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
    
    /**
     * Tìm booking cần nhắc nhở thanh toán
     */
    @Query("""
        SELECT b FROM Booking b 
        WHERE b.status = 'PENDING' 
        AND b.createdAt BETWEEN :startTime AND :endTime
        """)
    List<Booking> findBookingsForPaymentReminder(@Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);
} 