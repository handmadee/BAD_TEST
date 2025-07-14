package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.ApiResponse;
import com.badminton.courtmanagement.dto.CreateMessageRequest;
import com.badminton.courtmanagement.dto.MessageDto;
import com.badminton.courtmanagement.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Message Management", description = "API quản lý tin nhắn")
public class MessageController {
    
    private final MessageService messageService;
    
    @PostMapping
    @Operation(summary = "Gửi tin nhắn", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<MessageDto> sendMessage(@Valid @RequestBody CreateMessageRequest request) {
        log.debug("Sending message to user: {}", request.getReceiverId());
        MessageDto message = messageService.sendMessage(request);
        return ApiResponse.success("Gửi tin nhắn thành công", message);
    }
    
    @GetMapping("/conversations")
    @Operation(summary = "Lấy danh sách cuộc trò chuyện", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<List<MessageDto>> getConversations() {
        log.debug("Getting conversations for current user");
        List<MessageDto> conversations = messageService.getConversations();
        return ApiResponse.success(conversations);
    }
    
    @GetMapping("/conversation/{userId}")
    @Operation(summary = "Lấy cuộc trò chuyện với user cụ thể", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<List<MessageDto>> getConversation(
            @Parameter(description = "ID của user cần trò chuyện") @PathVariable Long userId) {
        
        log.debug("Getting conversation with user: {}", userId);
        List<MessageDto> messages = messageService.getConversation(userId);
        return ApiResponse.success(messages);
    }
    
    @PatchMapping("/{id}/read")
    @Operation(summary = "Đánh dấu tin nhắn đã đọc", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<MessageDto> markAsRead(
            @Parameter(description = "ID tin nhắn") @PathVariable Long id) {
        
        log.debug("Marking message as read: {}", id);
        MessageDto message = messageService.markAsRead(id);
        return ApiResponse.success("Đã đánh dấu tin nhắn", message);
    }
    
    @GetMapping("/unread-count")
    @Operation(summary = "Lấy số tin nhắn chưa đọc", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('USER') or hasRole('COURT_OWNER') or hasRole('ADMIN')")
    public ApiResponse<Long> getUnreadCount() {
        log.debug("Getting unread message count");
        long count = messageService.getUnreadCount();
        return ApiResponse.success(count);
    }
    
    @GetMapping("/post/{postId}")
    @Operation(summary = "Lấy tin nhắn theo bài đăng team")
    public ApiResponse<List<MessageDto>> getMessagesByPost(
            @Parameter(description = "ID bài đăng") @PathVariable Long postId) {
        
        log.debug("Getting messages for post: {}", postId);
        List<MessageDto> messages = messageService.getMessagesByPost(postId);
        return ApiResponse.success(messages);
    }
} 