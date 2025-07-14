package com.badminton.courtmanagement.service.impl;

import com.badminton.courtmanagement.constants.ErrorConstants;
import com.badminton.courtmanagement.dto.CreateMessageRequest;
import com.badminton.courtmanagement.dto.MessageDto;
import com.badminton.courtmanagement.entity.Message;
import com.badminton.courtmanagement.entity.TeamPost;
import com.badminton.courtmanagement.entity.User;
import com.badminton.courtmanagement.exception.ResourceNotFoundException;
import com.badminton.courtmanagement.exception.ValidationException;
import com.badminton.courtmanagement.mapper.MessageMapper;
import com.badminton.courtmanagement.repository.MessageRepository;
import com.badminton.courtmanagement.repository.TeamPostRepository;
import com.badminton.courtmanagement.repository.UserRepository;
import com.badminton.courtmanagement.service.MessageService;
import com.badminton.courtmanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MessageServiceImpl implements MessageService {
    
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final TeamPostRepository teamPostRepository;
    private final MessageMapper messageMapper;
    
    @Override
    @Transactional
    public MessageDto sendMessage(CreateMessageRequest request) {
        log.debug("Sending message to user: {}", request.getReceiverId());
        
        User currentUser = getCurrentUser();
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
        
        // Validate not sending to self
        if (currentUser.getId().equals(receiver.getId())) {
            throw new ValidationException(ErrorConstants.CANNOT_MESSAGE_YOURSELF);
        }
        
        // Create message entity
        Message message = messageMapper.toEntity(request);
        message.setSender(currentUser);
        message.setReceiver(receiver);
        
        // Set related entities if provided
        if (request.getRelatedPostId() != null) {
            TeamPost relatedPost = teamPostRepository.findById(request.getRelatedPostId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
            message.setRelatedPost(relatedPost);
        }
        
        Message savedMessage = messageRepository.save(message);
        
        log.info("Message sent from user {} to user {}", currentUser.getId(), receiver.getId());
        return messageMapper.toDto(savedMessage);
    }
    
    @Override
    public List<MessageDto> getConversation(Long otherUserId) {
        log.debug("Getting conversation with user: {}", otherUserId);
        
        User currentUser = getCurrentUser();
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
        
        List<Message> messages = messageRepository.findConversationBetweenUsers(currentUser, otherUser);
        return messageMapper.toDtoList(messages);
    }
    
    @Override
    public List<MessageDto> getConversations() {
        log.debug("Getting conversations for current user");
        
        User currentUser = getCurrentUser();
        List<Message> latestMessages = messageRepository.findLatestConversations(currentUser);
        return messageMapper.toDtoList(latestMessages);
    }
    
    @Override
    @Transactional
    public MessageDto markAsRead(Long messageId) {
        log.debug("Marking message as read: {}", messageId);
        
        User currentUser = getCurrentUser();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.MESSAGE_NOT_FOUND));
        
        // Only receiver can mark as read
        if (!message.getReceiver().getId().equals(currentUser.getId())) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        message.setIsRead(true);
        message.setReadAt(LocalDateTime.now());
        
        Message savedMessage = messageRepository.save(message);
        return messageMapper.toDto(savedMessage);
    }
    
    @Override
    public long getUnreadCount() {
        log.debug("Getting unread count for current user");
        
        User currentUser = getCurrentUser();
        return messageRepository.countByReceiverAndIsReadFalse(currentUser);
    }
    
    @Override
    public List<MessageDto> getMessagesByPost(Long postId) {
        log.debug("Getting messages for post: {}", postId);
        
        List<Message> messages = messageRepository.findByRelatedPostIdOrderByCreatedAtAsc(postId);
        return messageMapper.toDtoList(messages);
    }
    
    private User getCurrentUser() {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
    }
} 