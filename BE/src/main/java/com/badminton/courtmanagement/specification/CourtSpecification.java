package com.badminton.courtmanagement.specification;

import com.badminton.courtmanagement.entity.Court;
import com.badminton.courtmanagement.entity.CourtOwner;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CourtSpecification {
    
    /**
     * Tìm theo tên sân (gần đúng, không phân biệt hoa thường)
     */
    public static Specification<Court> hasNameContaining(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("name")), 
                "%" + name.toLowerCase() + "%"
            );
        };
    }
    
    /**
     * Tìm theo địa chỉ (gần đúng, không phân biệt hoa thường)
     */
    public static Specification<Court> hasAddressContaining(String address) {
        return (root, query, criteriaBuilder) -> {
            if (address == null || address.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("address")), 
                "%" + address.toLowerCase() + "%"
            );
        };
    }
    
    /**
     * Tìm theo loại thể thao
     */
    public static Specification<Court> hasSportType(String sportType) {
        return (root, query, criteriaBuilder) -> {
            if (sportType == null || sportType.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("sportTypes")), 
                "%" + sportType.toLowerCase() + "%"
            );
        };
    }
    
    /**
     * Tìm theo trạng thái
     */
    public static Specification<Court> hasStatus(Court.CourtStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }
    
    /**
     * Tìm theo chủ sân
     */
    public static Specification<Court> hasOwner(Long ownerId) {
        return (root, query, criteriaBuilder) -> {
            if (ownerId == null) {
                return criteriaBuilder.conjunction();
            }
            Join<Court, CourtOwner> ownerJoin = root.join("owner");
            return criteriaBuilder.equal(ownerJoin.get("id"), ownerId);
        };
    }
    
    /**
     * Tìm theo khoảng đánh giá
     */
    public static Specification<Court> hasRatingBetween(BigDecimal minRating, BigDecimal maxRating) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (minRating != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("averageRating"), minRating));
            }
            
            if (maxRating != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("averageRating"), maxRating));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    /**
     * Tìm theo số đánh giá tối thiểu
     */
    public static Specification<Court> hasMinReviews(Integer minReviews) {
        return (root, query, criteriaBuilder) -> {
            if (minReviews == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("totalReviews"), minReviews);
        };
    }
    
    /**
     * Tìm theo tiện ích
     */
    public static Specification<Court> hasAmenity(String amenity) {
        return (root, query, criteriaBuilder) -> {
            if (amenity == null || amenity.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("amenities")), 
                "%" + amenity.toLowerCase() + "%"
            );
        };
    }
    
    /**
     * Tìm theo số điện thoại
     */
    public static Specification<Court> hasPhone(String phone) {
        return (root, query, criteriaBuilder) -> {
            if (phone == null || phone.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("phone"), phone);
        };
    }
    
    /**
     * Tìm theo email
     */
    public static Specification<Court> hasEmail(String email) {
        return (root, query, criteriaBuilder) -> {
            if (email == null || email.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("email")), 
                email.toLowerCase()
            );
        };
    }
    
    /**
     * Tìm trong vùng địa lý (bounding box)
     */
    public static Specification<Court> withinBounds(BigDecimal minLat, BigDecimal maxLat, 
                                                   BigDecimal minLng, BigDecimal maxLng) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (minLat != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("latitude"), minLat));
            }
            
            if (maxLat != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("latitude"), maxLat));
            }
            
            if (minLng != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("longitude"), minLng));
            }
            
            if (maxLng != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("longitude"), maxLng));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    /**
     * Tìm kiếm tổng hợp (tên hoặc địa chỉ)
     */
    public static Specification<Court> searchByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            
            String searchPattern = "%" + keyword.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("sportTypes")), searchPattern)
            );
        };
    }
    
    /**
     * Chỉ lấy sân active
     */
    public static Specification<Court> isActive() {
        return hasStatus(Court.CourtStatus.ACTIVE);
    }
    
    /**
     * Kết hợp nhiều điều kiện tìm kiếm
     */
    public static Specification<Court> buildSearchSpecification(String keyword, 
                                                               String sportType,
                                                               BigDecimal minRating,
                                                               BigDecimal maxRating,
                                                               Integer minReviews,
                                                               Long ownerId,
                                                               Court.CourtStatus status) {
        return Specification.where(searchByKeyword(keyword))
                .and(hasSportType(sportType))
                .and(hasRatingBetween(minRating, maxRating))
                .and(hasMinReviews(minReviews))
                .and(hasOwner(ownerId))
                .and(hasStatus(status != null ? status : Court.CourtStatus.ACTIVE));
    }
} 