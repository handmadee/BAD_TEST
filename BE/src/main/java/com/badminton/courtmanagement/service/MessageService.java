package com.badminton.courtmanagement.service;

import com.badminton.courtmanagement.dto.CreateMessageRequest;
import com.badminton.courtmanagement.dto.MessageDto;
import com.badminton.courtmanagement.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MessageService {
    
    /**
     * Gửi tin nhắn mới
     */
    MessageDto sendMessage(CreateMessageRequest request);
    
    /**
     * Lấy cuộc trò chuyện giữa hai người dùng
     */
    List<MessageDto> getConversation(Long otherUserId);
    
    /**
     * Lấy danh sách cuộc trò chuyện của user hiện tại
     */
    List<MessageDto> getConversations();
    
    /**
     * Đánh dấu tin nhắn đã đọc
     */
    MessageDto markAsRead(Long messageId);
    
    /**
     * Lấy số tin nhắn chưa đọc
     */
    long getUnreadCount();
    
    /**
     * Lấy tin nhắn theo related post
     */
    List<MessageDto> getMessagesByPost(Long postId);
} 