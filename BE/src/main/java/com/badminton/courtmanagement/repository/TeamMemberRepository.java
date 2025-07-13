package com.badminton.courtmanagement.repository;

import com.badminton.courtmanagement.entity.TeamMember;
import com.badminton.courtmanagement.entity.TeamPost;
import com.badminton.courtmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    
    // Find by team post
    List<TeamMember> findByTeamPost(TeamPost teamPost);
    List<TeamMember> findByTeamPostOrderByCreatedAtAsc(TeamPost teamPost);
    
    // Find by user
    List<TeamMember> findByUser(User user);
    List<TeamMember> findByUserOrderByCreatedAtDesc(User user);
    
    // Find by team post and user
    Optional<TeamMember> findByTeamPostAndUser(TeamPost teamPost, User user);
    
    // Find by status
    List<TeamMember> findByTeamPostAndStatus(TeamPost teamPost, TeamMember.MemberStatus status);
    
    // Check if user is in team
    @Query("SELECT CASE WHEN COUNT(tm) > 0 THEN true ELSE false END FROM TeamMember tm " +
           "WHERE tm.teamPost.id = :teamPostId AND tm.user.id = :userId")
    boolean existsByTeamPostIdAndUserId(@Param("teamPostId") Long teamPostId, @Param("userId") Long userId);
    
    // Count members by status
    long countByTeamPostAndStatus(TeamPost teamPost, TeamMember.MemberStatus status);
    long countByTeamPost(TeamPost teamPost);
    
    // Delete by team post and user
    void deleteByTeamPostAndUser(TeamPost teamPost, User user);
} 