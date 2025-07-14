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
import java.time.LocalTime;
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
    @Column(nullable = false, length = 255)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotBlank(message = "Địa chỉ không được để trống")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;
    
    @Column(length = 100)
    private String city;
    
    @Column(length = 100)
    private String district;
    
    @DecimalMin(value = "-90.0", message = "Latitude phải >= -90")
    @DecimalMax(value = "90.0", message = "Latitude phải <= 90")
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @DecimalMin(value = "-180.0", message = "Longitude phải >= -180")
    @DecimalMax(value = "180.0", message = "Longitude phải <= 180")
    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(name = "sport_types", columnDefinition = "SET('BADMINTON', 'PICKLEBALL')", nullable = false)
    private String sportTypes;
    
    @Column(name = "total_courts", nullable = false)
    @Builder.Default
    private Integer totalCourts = 1;
    
    @Column(name = "opening_time")
    @Builder.Default
    private LocalTime openingTime = LocalTime.of(6, 0);
    
    @Column(name = "closing_time")
    @Builder.Default
    private LocalTime closingTime = LocalTime.of(22, 0);
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 255)
    private String email;
    
    @Column(name = "facebook_url", length = 255)
    private String facebookUrl;
    
    @Column(columnDefinition = "JSON")
    private String amenities;
    
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
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean featured = false;
    
    @Column(columnDefinition = "JSON")
    private String images;
    
    @Column(name = "cover_image", length = 500)
    private String coverImage;
    
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
        ACTIVE, INACTIVE
    }
} 