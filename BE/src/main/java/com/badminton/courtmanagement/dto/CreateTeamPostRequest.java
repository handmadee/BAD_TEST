package com.badminton.courtmanagement.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamPostRequest {
    
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    
    private String description;
    
    @NotNull(message = "Thời gian chơi không được để trống")
    @Future(message = "Thời gian chơi phải trong tương lai")
    private LocalDateTime playDate;
    
    @NotBlank(message = "Địa điểm không được để trống")
    private String location;
    
    @NotNull(message = "Số lượng người chơi tối đa không được để trống")
    @Min(value = 2, message = "Số lượng người chơi tối đa phải ít nhất 2")
    private Integer maxPlayers;
    
    @Builder.Default
    private Integer currentPlayers = 1;
    
    private String skillLevel;
} 