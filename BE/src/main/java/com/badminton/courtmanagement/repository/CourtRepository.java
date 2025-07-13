package com.badminton.courtmanagement.repository;

import com.badminton.courtmanagement.entity.Court;
import com.badminton.courtmanagement.entity.CourtOwner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long>, JpaSpecificationExecutor<Court> {
    
    /**
     * Tìm sân theo trạng thái
     */
    Page<Court> findByStatus(Court.CourtStatus status, Pageable pageable);
    
    /**
     * Tìm sân theo chủ sân
     */
    Page<Court> findByOwner(CourtOwner owner, Pageable pageable);
    
    /**
     * Tìm sân theo chủ sân và trạng thái
     */
    Page<Court> findByOwnerAndStatus(CourtOwner owner, Court.CourtStatus status, Pageable pageable);
    
    /**
     * Tìm sân theo tên (tìm kiếm gần đúng)
     */
    @Query("SELECT c FROM Court c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')) AND c.status = :status")
    Page<Court> findByNameContainingIgnoreCaseAndStatus(@Param("name") String name, 
                                                       @Param("status") Court.CourtStatus status, 
                                                       Pageable pageable);
    
    /**
     * Tìm sân theo địa chỉ (tìm kiếm gần đúng)
     */
    @Query("SELECT c FROM Court c WHERE LOWER(c.address) LIKE LOWER(CONCAT('%', :address, '%')) AND c.status = :status")
    Page<Court> findByAddressContainingIgnoreCaseAndStatus(@Param("address") String address, 
                                                          @Param("status") Court.CourtStatus status, 
                                                          Pageable pageable);
    
    /**
     * Tìm sân theo loại thể thao
     */
    @Query("SELECT c FROM Court c WHERE LOWER(c.sportTypes) LIKE LOWER(CONCAT('%', :sportType, '%')) AND c.status = :status")
    Page<Court> findBySportTypesContainingIgnoreCaseAndStatus(@Param("sportType") String sportType, 
                                                             @Param("status") Court.CourtStatus status, 
                                                             Pageable pageable);
    
    /**
     * Tìm sân trong bán kính (sử dụng Haversine formula)
     */
    @Query(value = """
        SELECT c.*, 
               (6371 * acos(cos(radians(:latitude)) * cos(radians(c.latitude)) * 
                           cos(radians(c.longitude) - radians(:longitude)) + 
                           sin(radians(:latitude)) * sin(radians(c.latitude)))) AS distance
        FROM courts c 
        WHERE c.status = :#{#status.name()}
        HAVING distance <= :radiusKm 
        ORDER BY distance
        """, nativeQuery = true)
    List<Object[]> findCourtsWithinRadius(@Param("latitude") BigDecimal latitude,
                                         @Param("longitude") BigDecimal longitude,
                                         @Param("radiusKm") Double radiusKm,
                                         @Param("status") Court.CourtStatus status);
    
    /**
     * Tìm sân theo khoảng đánh giá
     */
    @Query("SELECT c FROM Court c WHERE c.averageRating >= :minRating AND c.averageRating <= :maxRating AND c.status = :status")
    Page<Court> findByRatingRange(@Param("minRating") BigDecimal minRating,
                                 @Param("maxRating") BigDecimal maxRating,
                                 @Param("status") Court.CourtStatus status,
                                 Pageable pageable);
    
    /**
     * Tìm top sân có đánh giá cao nhất
     */
    @Query("SELECT c FROM Court c WHERE c.status = :status AND c.totalReviews >= :minReviews ORDER BY c.averageRating DESC, c.totalReviews DESC")
    Page<Court> findTopRatedCourts(@Param("status") Court.CourtStatus status,
                                  @Param("minReviews") Integer minReviews,
                                  Pageable pageable);
    
    /**
     * Tìm sân mới nhất
     */
    @Query("SELECT c FROM Court c WHERE c.status = :status ORDER BY c.createdAt DESC")
    Page<Court> findNewestCourts(@Param("status") Court.CourtStatus status, Pageable pageable);
    
    /**
     * Đếm số sân theo trạng thái
     */
    long countByStatus(Court.CourtStatus status);
    
    /**
     * Đếm số sân theo chủ sân và trạng thái
     */
    long countByOwnerAndStatus(CourtOwner owner, Court.CourtStatus status);
    
    /**
     * Kiểm tra sân có tồn tại với tên và địa chỉ không
     */
    boolean existsByNameAndAddressAndOwner(String name, String address, CourtOwner owner);
    
    /**
     * Tìm sân theo ID và trạng thái
     */
    Optional<Court> findByIdAndStatus(Long id, Court.CourtStatus status);
    
    /**
     * Tìm sân theo email
     */
    Optional<Court> findByEmailAndStatus(String email, Court.CourtStatus status);
    
    /**
     * Tìm sân theo số điện thoại
     */
    Optional<Court> findByPhoneAndStatus(String phone, Court.CourtStatus status);
    
    /**
     * Tìm tất cả sân active
     */
    @Query("SELECT c FROM Court c WHERE c.status = 'ACTIVE'")
    List<Court> findAllActiveCourts();
    
    /**
     * Tìm sân có booking trong khoảng thời gian
     */
    @Query("""
        SELECT DISTINCT c FROM Court c 
        JOIN c.bookings b 
        WHERE b.bookingDate BETWEEN :startDate AND :endDate 
        AND b.status IN ('CONFIRMED', 'COMPLETED') 
        AND c.status = :status
        """)
    List<Court> findCourtsWithBookingsBetween(@Param("startDate") java.time.LocalDate startDate,
                                             @Param("endDate") java.time.LocalDate endDate,
                                             @Param("status") Court.CourtStatus status);
} 