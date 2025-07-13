package com.badminton.courtmanagement.dto;

import com.badminton.courtmanagement.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private User.Gender gender;
    private String profileImage;
    private String facebookUrl;
    private User.UserRole role;
    private User.UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 