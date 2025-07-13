package com.badminton.courtmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "team_posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class TeamPost extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotBlank
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @Column(name = "play_date", nullable = false)
    private LocalDateTime playDate;
    
    @Column(length = 500)
    private String location;
    
    @NotNull
    @Column(name = "max_players", nullable = false)
    private Integer maxPlayers;
    
    @Builder.Default
    @Column(name = "current_players")
    private Integer currentPlayers = 1;
    
    @Column(name = "skill_level", length = 20)
    private String skillLevel;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostStatus status = PostStatus.OPEN;
    
    @OneToMany(mappedBy = "teamPost", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<TeamMember> members;
    
    public enum PostStatus {
        OPEN, CLOSED, CANCELLED
    }
} 