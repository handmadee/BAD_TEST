package com.badminton.courtmanagement.dto;

import com.badminton.courtmanagement.entity.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMessageRequest {
    
    @NotNull(message = "ID người nhận không được để trống")
    private Long receiverId;
    
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;
    
    @Builder.Default
    private Message.MessageType messageType = Message.MessageType.TEXT;
    
    private Long relatedCourtId;
    private Long relatedBookingId;
    private Long relatedPostId;
} 