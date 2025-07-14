package com.badminton.courtmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Review extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "court_id", nullable = false)
    private Court court;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;
    
    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "overall_rating", nullable = false)
    private Integer overallRating;
    
    @Column(length = 255)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "visit_date")
    private LocalDate visitDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sport_played")
    private SportType sportPlayed;
    
    @Column(name = "would_recommend")
    private Boolean wouldRecommend;
    
    @Column(columnDefinition = "JSON")
    private String images;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReviewStatus status = ReviewStatus.PUBLISHED;
    
    public enum SportType {
        BADMINTON, PICKLEBALL
    }
    
    public enum ReviewStatus {
        PUBLISHED, PENDING, REJECTED
    }
} 