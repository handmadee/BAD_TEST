package com.badminton.courtmanagement.service;

import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.TeamPost;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface TeamPostService {
    
    // CRUD operations
    TeamPostDto createTeamPost(CreateTeamPostRequest request);
    TeamPostDto getTeamPostById(Long id);
    TeamPostDto updateTeamPost(Long id, CreateTeamPostRequest request);
    void deleteTeamPost(Long id);
    
    // Listing and search
    PageResponse<TeamPostDto> getAllTeamPosts(Pageable pageable);
    PageResponse<TeamPostDto> getMyTeamPosts(Pageable pageable);
    PageResponse<TeamPostDto> getJoinedTeams(Pageable pageable);
    PageResponse<TeamPostDto> searchTeamPosts(String keyword, String sport, String skillLevel, 
                                             String location, String date, Pageable pageable);
    
    // Team member management
    TeamMemberDto joinTeamPost(Long teamPostId);
    TeamMemberDto leaveTeamPost(Long teamPostId);
    TeamMemberDto acceptMember(Long teamPostId, Long memberId);
    TeamMemberDto rejectMember(Long teamPostId, Long memberId);
    List<TeamMemberDto> getTeamMembers(Long teamPostId);
    
    // Status management
    TeamPostDto updateTeamPostStatus(Long id, TeamPost.PostStatus status);
    TeamPostDto closeTeamPost(Long id);
    TeamPostDto reopenTeamPost(Long id);
    
    // Statistics and reporting
    Map<String, Object> getTeamPostStatistics(Long userId);
    List<TeamPostDto> getUpcomingTeamPosts(Long userId);
    List<TeamPostDto> getPopularTeamPosts(int limit);
    
    // Utility methods
    boolean isTeamPostFull(Long teamPostId);
    boolean isUserInTeam(Long teamPostId, Long userId);
    boolean canUserJoinTeam(Long teamPostId, Long userId);
    
    // Message and join
    TeamMemberDto sendMessageAndJoinRequest(Long teamPostId, String message);
} 