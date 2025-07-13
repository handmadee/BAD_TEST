package com.badminton.courtmanagement.repository;

import com.badminton.courtmanagement.entity.TeamPost;
import com.badminton.courtmanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TeamPostRepository extends JpaRepository<TeamPost, Long>, JpaSpecificationExecutor<TeamPost> {
    
    // Find by user
    Page<TeamPost> findByUser(User user, Pageable pageable);
    Page<TeamPost> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find by status
    Page<TeamPost> findByStatusOrderByCreatedAtDesc(TeamPost.PostStatus status, Pageable pageable);
    
    // Find upcoming posts
    @Query("SELECT tp FROM TeamPost tp WHERE tp.playDate > :currentTime AND tp.status = :status ORDER BY tp.playDate ASC")
    List<TeamPost> findUpcomingTeamPosts(@Param("currentTime") LocalDateTime currentTime, 
                                        @Param("status") TeamPost.PostStatus status);
    
    // Find upcoming posts by user
    @Query("SELECT tp FROM TeamPost tp WHERE tp.user = :user AND tp.playDate > :currentTime ORDER BY tp.playDate ASC")
    List<TeamPost> findUpcomingTeamPostsByUser(@Param("user") User user, 
                                              @Param("currentTime") LocalDateTime currentTime);
    
    // Find popular posts (with most members)
    @Query("SELECT tp FROM TeamPost tp WHERE tp.status = :status ORDER BY tp.currentPlayers DESC")
    List<TeamPost> findPopularTeamPosts(@Param("status") TeamPost.PostStatus status, Pageable pageable);
    
    // Search by location
    @Query("SELECT tp FROM TeamPost tp WHERE LOWER(tp.location) LIKE LOWER(CONCAT('%', :location, '%')) ORDER BY tp.createdAt DESC")
    Page<TeamPost> findByLocationContainingIgnoreCase(@Param("location") String location, Pageable pageable);
    
    // Search by skill level
    Page<TeamPost> findBySkillLevelContainingIgnoreCaseOrderByCreatedAtDesc(String skillLevel, Pageable pageable);
    
    // Search by title or description
    @Query("SELECT tp FROM TeamPost tp WHERE LOWER(tp.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(tp.description) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY tp.createdAt DESC")
    Page<TeamPost> findByKeywordInTitleOrDescription(@Param("keyword") String keyword, Pageable pageable);
    
    // Find by date range
    @Query("SELECT tp FROM TeamPost tp WHERE tp.playDate BETWEEN :startDate AND :endDate ORDER BY tp.playDate ASC")
    Page<TeamPost> findByPlayDateBetween(@Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    // Count statistics
    long countByUser(User user);
    long countByUserAndStatus(User user, TeamPost.PostStatus status);
    
    // Check if post is full
    @Query("SELECT CASE WHEN tp.currentPlayers >= tp.maxPlayers THEN true ELSE false END FROM TeamPost tp WHERE tp.id = :teamPostId")
    boolean isTeamPostFull(@Param("teamPostId") Long teamPostId);
} 