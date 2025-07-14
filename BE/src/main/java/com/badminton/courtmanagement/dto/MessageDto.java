package com.badminton.courtmanagement.dto;

import com.badminton.courtmanagement.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    
    private Long id;
    private UserDto sender;
    private UserDto receiver;
    private Message.MessageType messageType;
    private String content;
    private Long relatedCourtId;
    private Long relatedBookingId; 
    private Long relatedPostId;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 