package com.badminton.courtmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Entity
@Table(name = "courts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Court extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Chủ sân không được để trống")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private CourtOwner owner;
    
    @NotBlank(message = "Tên sân không được để trống")
    @Column(nullable = false, length = 200)
    private String name;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    @Column(nullable = false, length = 500)
    private String address;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 15)
    private String phone;
    
    @Column(length = 100)
    private String email;
    
    @Column(name = "facebook_url")
    private String facebookUrl;
    
    @Column(name = "operating_hours", length = 100)
    private String operatingHours;
    
    @Column(name = "sport_types", length = 100)
    private String sportTypes;
    
    @Column(columnDefinition = "TEXT")
    private String amenities;
    
    @Column(columnDefinition = "TEXT")
    private String images;
    
    @DecimalMin(value = "0.0", message = "Vĩ độ phải >= 0")
    @DecimalMax(value = "90.0", message = "Vĩ độ phải <= 90")
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @DecimalMin(value = "-180.0", message = "Kinh độ phải >= -180")
    @DecimalMax(value = "180.0", message = "Kinh độ phải <= 180")
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Builder.Default
    @DecimalMin(value = "0.0", message = "Đánh giá phải >= 0")
    @DecimalMax(value = "5.0", message = "Đánh giá phải <= 5")
    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    @Builder.Default
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CourtStatus status = CourtStatus.ACTIVE;
    
    // Relationships
    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<CourtPricing> pricings;
    
    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Booking> bookings;
    
    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Review> reviews;
    
    @OneToMany(mappedBy = "court", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<UserFavorite> favorites;
    
    // Enums
    public enum CourtStatus {
        ACTIVE, INACTIVE, MAINTENANCE, SUSPENDED
    }
} 