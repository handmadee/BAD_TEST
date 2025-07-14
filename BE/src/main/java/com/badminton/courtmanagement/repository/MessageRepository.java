package com.badminton.courtmanagement.repository;

import com.badminton.courtmanagement.entity.Message;
import com.badminton.courtmanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    // Find conversation between two users
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversationBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    // Find conversations for a user (latest message per conversation)
    @Query("SELECT m FROM Message m WHERE m.id IN (" +
           "SELECT MAX(m2.id) FROM Message m2 WHERE " +
           "m2.sender = :user OR m2.receiver = :user " +
           "GROUP BY CASE WHEN m2.sender = :user THEN m2.receiver ELSE m2.sender END" +
           ") ORDER BY m.createdAt DESC")
    List<Message> findLatestConversations(@Param("user") User user);
    
    // Find unread messages for user
    List<Message> findByReceiverAndIsReadFalseOrderByCreatedAtDesc(User receiver);
    
    // Count unread messages
    long countByReceiverAndIsReadFalse(User receiver);
    
    // Find messages by related post
    List<Message> findByRelatedPostIdOrderByCreatedAtAsc(Long postId);
    
    // Find messages by sender
    Page<Message> findBySenderOrderByCreatedAtDesc(User sender, Pageable pageable);
    
    // Find messages by receiver  
    Page<Message> findByReceiverOrderByCreatedAtDesc(User receiver, Pageable pageable);
} 