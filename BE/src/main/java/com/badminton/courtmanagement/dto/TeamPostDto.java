package com.badminton.courtmanagement.dto;

import com.badminton.courtmanagement.entity.TeamPost;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamPostDto {
    
    private Long id;
    private UserDto user;
    private String title;
    private String description;
    private LocalDateTime playDate;
    private String location;
    private Integer maxPlayers;
    private Integer currentPlayers;
    private String skillLevel;
    private TeamPost.PostStatus status;
    private TeamPost.SportType sportType;
    private List<String> images;
    private List<TeamMemberDto> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed fields
    private boolean isFull;
    private boolean canJoin;
    private int availableSlots;
} 