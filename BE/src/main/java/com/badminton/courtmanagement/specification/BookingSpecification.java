package com.badminton.courtmanagement.specification;

import com.badminton.courtmanagement.entity.Booking;
import com.badminton.courtmanagement.entity.Court;
import com.badminton.courtmanagement.entity.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BookingSpecification {
    
    /**
     * Tìm theo user
     */
    public static Specification<Booking> hasUser(Long userId) {
        return (root, query, criteriaBuilder) -> {
            if (userId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Booking, User> userJoin = root.join("user");
            return criteriaBuilder.equal(userJoin.get("id"), userId);
        };
    }
    
    /**
     * Tìm theo sân
     */
    public static Specification<Booking> hasCourt(Long courtId) {
        return (root, query, criteriaBuilder) -> {
            if (courtId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Booking, Court> courtJoin = root.join("court");
            return criteriaBuilder.equal(courtJoin.get("id"), courtId);
        };
    }
    
    /**
     * Tìm theo chủ sân
     */
    public static Specification<Booking> hasCourtOwner(Long ownerId) {
        return (root, query, criteriaBuilder) -> {
            if (ownerId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Booking, Court> courtJoin = root.join("court");
            return criteriaBuilder.equal(courtJoin.get("owner").get("id"), ownerId);
        };
    }
    
    /**
     * Tìm theo trạng thái
     */
    public static Specification<Booking> hasStatus(Booking.BookingStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }
    
    /**
     * Tìm theo ngày đặt sân
     */
    public static Specification<Booking> hasBookingDate(LocalDate bookingDate) {
        return (root, query, criteriaBuilder) -> {
            if (bookingDate == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("bookingDate"), bookingDate);
        };
    }
    
    /**
     * Tìm trong khoảng ngày
     */
    public static Specification<Booking> hasBookingDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("bookingDate"), startDate));
            }
            
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("bookingDate"), endDate));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    /**
     * Tìm trong khoảng thời gian tạo
     */
    public static Specification<Booking> hasCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (startDateTime != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDateTime));
            }
            
            if (endDateTime != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDateTime));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    /**
     * Tìm booking hôm nay
     */
    public static Specification<Booking> isToday() {
        return hasBookingDate(LocalDate.now());
    }
    
    /**
     * Tìm booking tương lai
     */
    public static Specification<Booking> isFuture() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.greaterThan(root.get("bookingDate"), LocalDate.now());
    }
    
    /**
     * Tìm booking quá khứ
     */
    public static Specification<Booking> isPast() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.lessThan(root.get("bookingDate"), LocalDate.now());
    }
    
    /**
     * Tìm booking đang chờ thanh toán
     */
    public static Specification<Booking> isPending() {
        return hasStatus(Booking.BookingStatus.PENDING);
    }
    
    /**
     * Tìm booking đã xác nhận
     */
    public static Specification<Booking> isConfirmed() {
        return hasStatus(Booking.BookingStatus.CONFIRMED);
    }
    
    /**
     * Tìm booking đã hoàn thành
     */
    public static Specification<Booking> isCompleted() {
        return hasStatus(Booking.BookingStatus.COMPLETED);
    }
    
    /**
     * Tìm booking đã hủy
     */
    public static Specification<Booking> isCancelled() {
        return hasStatus(Booking.BookingStatus.CANCELLED);
    }
    
    /**
     * Tìm booking quá hạn thanh toán
     */
    public static Specification<Booking> isOverdue(LocalDateTime cutoffTime) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.and(
                criteriaBuilder.equal(root.get("status"), Booking.BookingStatus.PENDING),
                criteriaBuilder.lessThan(root.get("createdAt"), cutoffTime)
            );
    }
    
    /**
     * Tìm booking sắp diễn ra (trong 24h tới)
     */
    public static Specification<Booking> isUpcoming() {
        return (root, query, criteriaBuilder) -> {
            LocalDate today = LocalDate.now();
            LocalDate tomorrow = today.plusDays(1);
            
            return criteriaBuilder.and(
                criteriaBuilder.equal(root.get("status"), Booking.BookingStatus.CONFIRMED),
                criteriaBuilder.between(root.get("bookingDate"), today, tomorrow)
            );
        };
    }
    
    /**
     * Tìm theo tên sân
     */
    public static Specification<Booking> hasCourtName(String courtName) {
        return (root, query, criteriaBuilder) -> {
            if (courtName == null || courtName.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Booking, Court> courtJoin = root.join("court");
            return criteriaBuilder.like(
                criteriaBuilder.lower(courtJoin.get("name")), 
                "%" + courtName.toLowerCase() + "%"
            );
        };
    }
    
    /**
     * Tìm theo email user
     */
    public static Specification<Booking> hasUserEmail(String userEmail) {
        return (root, query, criteriaBuilder) -> {
            if (userEmail == null || userEmail.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Booking, User> userJoin = root.join("user");
            return criteriaBuilder.equal(
                criteriaBuilder.lower(userJoin.get("email")), 
                userEmail.toLowerCase()
            );
        };
    }
    
    /**
     * Tìm booking có ghi chú
     */
    public static Specification<Booking> hasNotes() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.and(
                criteriaBuilder.isNotNull(root.get("notes")),
                criteriaBuilder.notEqual(root.get("notes"), "")
            );
    }
    
    /**
     * Kết hợp nhiều điều kiện tìm kiếm
     */
    public static Specification<Booking> buildSearchSpecification(Long userId,
                                                                 Long courtId,
                                                                 Long ownerId,
                                                                 Booking.BookingStatus status,
                                                                 LocalDate startDate,
                                                                 LocalDate endDate,
                                                                 String courtName,
                                                                 String userEmail) {
        return Specification.where(hasUser(userId))
                .and(hasCourt(courtId))
                .and(hasCourtOwner(ownerId))
                .and(hasStatus(status))
                .and(hasBookingDateBetween(startDate, endDate))
                .and(hasCourtName(courtName))
                .and(hasUserEmail(userEmail));
    }
    
    /**
     * Tìm booking cần xử lý (pending hoặc confirmed trong tương lai gần)
     */
    public static Specification<Booking> needsAttention() {
        return (root, query, criteriaBuilder) -> {
            LocalDate today = LocalDate.now();
            LocalDate nextWeek = today.plusDays(7);
            
            return criteriaBuilder.or(
                // Booking pending
                criteriaBuilder.equal(root.get("status"), Booking.BookingStatus.PENDING),
                // Booking confirmed sắp diễn ra
                criteriaBuilder.and(
                    criteriaBuilder.equal(root.get("status"), Booking.BookingStatus.CONFIRMED),
                    criteriaBuilder.between(root.get("bookingDate"), today, nextWeek)
                )
            );
        };
    }
} 