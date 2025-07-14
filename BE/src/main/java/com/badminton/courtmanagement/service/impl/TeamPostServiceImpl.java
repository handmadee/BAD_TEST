package com.badminton.courtmanagement.service.impl;

import com.badminton.courtmanagement.constants.ErrorConstants;
import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.TeamMember;
import com.badminton.courtmanagement.entity.TeamPost;
import com.badminton.courtmanagement.entity.User;
import com.badminton.courtmanagement.exception.ResourceNotFoundException;
import com.badminton.courtmanagement.exception.ValidationException;
import com.badminton.courtmanagement.mapper.TeamMemberMapper;
import com.badminton.courtmanagement.mapper.TeamPostMapper;
import com.badminton.courtmanagement.repository.TeamMemberRepository;
import com.badminton.courtmanagement.repository.TeamPostRepository;
import com.badminton.courtmanagement.repository.UserRepository;
import com.badminton.courtmanagement.repository.MessageRepository;
import com.badminton.courtmanagement.entity.Message;
import com.badminton.courtmanagement.mapper.MessageMapper;
import com.badminton.courtmanagement.service.TeamPostService;
import com.badminton.courtmanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TeamPostServiceImpl implements TeamPostService {
    
    private final TeamPostRepository teamPostRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final TeamPostMapper teamPostMapper;
    private final TeamMemberMapper teamMemberMapper;
    private final MessageMapper messageMapper;
    
    @Override
    @Transactional
    public TeamPostDto createTeamPost(CreateTeamPostRequest request) {
        log.debug("Creating new team post: {}", request.getTitle());
        
        User currentUser = getCurrentUser();
        
        // Validate request
        validateTeamPostRequest(request);
        
        // Create team post entity
        TeamPost teamPost = teamPostMapper.toEntity(request);
        teamPost.setUser(currentUser);
        teamPost.setStatus(TeamPost.PostStatus.ACTIVE);
        
        // Convert sportType string to enum
        if (request.getSportType() != null) {
            teamPost.setSportType(TeamPost.SportType.valueOf(request.getSportType().toUpperCase()));
        }
        
        // Save team post
        TeamPost savedTeamPost = teamPostRepository.save(teamPost);
        
        // Create team member for the creator
        TeamMember creatorMember = TeamMember.builder()
                .teamPost(savedTeamPost)
                .user(currentUser)
                .status(TeamMember.MemberStatus.ACCEPTED)
                .build();
        teamMemberRepository.save(creatorMember);
        
        log.info("Created team post with id: {}", savedTeamPost.getId());
        return teamPostMapper.toDto(savedTeamPost);
    }
    
    @Override
    public TeamPostDto getTeamPostById(Long id) {
        log.debug("Getting team post by id: {}", id);
        
        TeamPost teamPost = teamPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        return teamPostMapper.toDto(teamPost);
    }
    
    @Override
    @Transactional
    public TeamPostDto updateTeamPost(Long id, CreateTeamPostRequest request) {
        log.debug("Updating team post id: {}", id);
        
        TeamPost teamPost = teamPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        // Check if user is the owner
        User currentUser = getCurrentUser();
        if (!teamPost.getUser().getId().equals(currentUser.getId()) && !SecurityUtils.hasRole("ADMIN")) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        // Validate request
        validateTeamPostRequest(request);
        
        // Update team post
        teamPostMapper.updateEntityFromRequest(request, teamPost);
        TeamPost savedTeamPost = teamPostRepository.save(teamPost);
        
        log.info("Updated team post id: {}", id);
        return teamPostMapper.toDto(savedTeamPost);
    }
    
    @Override
    @Transactional
    public void deleteTeamPost(Long id) {
        log.debug("Deleting team post id: {}", id);
        
        TeamPost teamPost = teamPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        // Check if user is the owner
        User currentUser = getCurrentUser();
        if (!teamPost.getUser().getId().equals(currentUser.getId()) && !SecurityUtils.hasRole("ADMIN")) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        teamPostRepository.delete(teamPost);
        log.info("Deleted team post id: {}", id);
    }
    
    @Override
    public PageResponse<TeamPostDto> getAllTeamPosts(Pageable pageable) {
        log.debug("Getting all team posts");
        
        Page<TeamPost> teamPosts = teamPostRepository.findByStatusOrderByCreatedAtDesc(
                TeamPost.PostStatus.ACTIVE, pageable);
        
        return PageResponse.of(teamPosts.map(teamPostMapper::toDto));
    }
    
    @Override
    public PageResponse<TeamPostDto> getMyTeamPosts(Pageable pageable) {
        log.debug("Getting my team posts");
        
        User currentUser = getCurrentUser();
        Page<TeamPost> teamPosts = teamPostRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable);
        
        return PageResponse.of(teamPosts.map(teamPostMapper::toDto));
    }

    @Override
    public PageResponse<TeamPostDto> getJoinedTeams(Pageable pageable) {
        log.debug("Getting joined teams");
        
        User currentUser = getCurrentUser();
        
        // Tìm các team mà user đã tham gia với status ACCEPTED
        List<TeamMember> acceptedMemberships = teamMemberRepository.findByUserAndStatus(
                currentUser, TeamMember.MemberStatus.ACCEPTED);
        
        // Lấy danh sách team posts từ các membership
        List<TeamPost> joinedTeamPosts = acceptedMemberships.stream()
                .map(TeamMember::getTeamPost)
                .distinct()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
        
        // Convert to page manually since we already have the filtered list
        int start = Math.min((int) pageable.getOffset(), joinedTeamPosts.size());
        int end = Math.min(start + pageable.getPageSize(), joinedTeamPosts.size());
        List<TeamPost> paginatedList = joinedTeamPosts.subList(start, end);
        
        Page<TeamPost> teamPostPage = new org.springframework.data.domain.PageImpl<>(
                paginatedList, pageable, joinedTeamPosts.size());
        
        return PageResponse.of(teamPostPage.map(teamPostMapper::toDto));
    }
    
    @Override
    public PageResponse<TeamPostDto> searchTeamPosts(String keyword, String sport, String skillLevel,
                                                    String location, String date, Pageable pageable) {
        log.debug("Searching team posts with filters");
        
        Specification<TeamPost> spec = createTeamPostSpecification(keyword, sport, skillLevel, location, date);
        Page<TeamPost> teamPosts = teamPostRepository.findAll(spec, pageable);
        
        return PageResponse.of(teamPosts.map(teamPostMapper::toDto));
    }
    
    @Override
    @Transactional
    public TeamMemberDto joinTeamPost(Long teamPostId) {
        log.debug("User joining team post id: {}", teamPostId);
        
        TeamPost teamPost = teamPostRepository.findById(teamPostId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        
        // Validate join request
        validateJoinRequest(teamPost, currentUser);
        
        // Create team member
        TeamMember teamMember = TeamMember.builder()
                .teamPost(teamPost)
                .user(currentUser)
                .status(TeamMember.MemberStatus.PENDING)
                .build();
        
        TeamMember savedMember = teamMemberRepository.save(teamMember);
        
        log.info("User {} joined team post {}", currentUser.getId(), teamPostId);
        return teamMemberMapper.toDto(savedMember);
    }
    
    @Override
    @Transactional
    public TeamMemberDto leaveTeamPost(Long teamPostId) {
        log.debug("User leaving team post id: {}", teamPostId);
        
        TeamPost teamPost = teamPostRepository.findById(teamPostId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        
        TeamMember teamMember = teamMemberRepository.findByTeamPostAndUser(teamPost, currentUser)
                .orElseThrow(() -> new ValidationException(ErrorConstants.USER_NOT_IN_TEAM));
        
        // Check if user is the creator
        if (teamPost.getUser().getId().equals(currentUser.getId())) {
            throw new ValidationException(ErrorConstants.CREATOR_CANNOT_LEAVE);
        }
        
        teamMemberRepository.delete(teamMember);
        
        // Update current players count
        teamPost.setCurrentPlayers(teamPost.getCurrentPlayers() - 1);
        teamPostRepository.save(teamPost);
        
        log.info("User {} left team post {}", currentUser.getId(), teamPostId);
        return teamMemberMapper.toDto(teamMember);
    }
    
    @Override
    @Transactional
    public TeamMemberDto acceptMember(Long teamPostId, Long memberId) {
        log.debug("Accepting member {} for team post {}", memberId, teamPostId);
        
        TeamPost teamPost = teamPostRepository.findById(teamPostId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        
        // Check if user is the creator
        if (!teamPost.getUser().getId().equals(currentUser.getId()) && !SecurityUtils.hasRole("ADMIN")) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        TeamMember teamMember = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_MEMBER_NOT_FOUND));
        
        if (!teamMember.getTeamPost().getId().equals(teamPostId)) {
            throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
        }
        
        // Check if team is full
        if (teamPost.getCurrentPlayers() >= teamPost.getMaxPlayers()) {
            throw new ValidationException(ErrorConstants.TEAM_FULL);
        }
        
        teamMember.setStatus(TeamMember.MemberStatus.ACCEPTED);
        TeamMember savedMember = teamMemberRepository.save(teamMember);
        
        // Update current players count
        teamPost.setCurrentPlayers(teamPost.getCurrentPlayers() + 1);
        teamPostRepository.save(teamPost);
        
        log.info("Accepted member {} for team post {}", memberId, teamPostId);
        return teamMemberMapper.toDto(savedMember);
    }
    
    @Override
    @Transactional
    public TeamMemberDto rejectMember(Long teamPostId, Long memberId) {
        log.debug("Rejecting member {} for team post {}", memberId, teamPostId);
        
        TeamPost teamPost = teamPostRepository.findById(teamPostId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        
        // Check if user is the creator
        if (!teamPost.getUser().getId().equals(currentUser.getId()) && !SecurityUtils.hasRole("ADMIN")) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        TeamMember teamMember = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_MEMBER_NOT_FOUND));
        
        if (!teamMember.getTeamPost().getId().equals(teamPostId)) {
            throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
        }
        
        teamMember.setStatus(TeamMember.MemberStatus.REJECTED);
        TeamMember savedMember = teamMemberRepository.save(teamMember);
        
        log.info("Rejected member {} for team post {}", memberId, teamPostId);
        return teamMemberMapper.toDto(savedMember);
    }
    
    @Override
    public List<TeamMemberDto> getTeamMembers(Long teamPostId) {
        log.debug("Getting team members for team post: {}", teamPostId);
        
        TeamPost teamPost = teamPostRepository.findById(teamPostId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        List<TeamMember> members = teamMemberRepository.findByTeamPostOrderByCreatedAtAsc(teamPost);
        return teamMemberMapper.toDtoList(members);
    }
    
    @Override
    @Transactional
    public TeamPostDto updateTeamPostStatus(Long id, TeamPost.PostStatus status) {
        log.debug("Updating team post {} status to: {}", id, status);
        
        TeamPost teamPost = teamPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        
        // Check if user is the creator
        if (!teamPost.getUser().getId().equals(currentUser.getId()) && !SecurityUtils.hasRole("ADMIN")) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        teamPost.setStatus(status);
        TeamPost savedTeamPost = teamPostRepository.save(teamPost);
        
        log.info("Updated team post {} status to: {}", id, status);
        return teamPostMapper.toDto(savedTeamPost);
    }
    
    @Override
    @Transactional
    public TeamPostDto closeTeamPost(Long id) {
        return updateTeamPostStatus(id, TeamPost.PostStatus.FULL);
    }
    
    @Override
    @Transactional
    public TeamPostDto reopenTeamPost(Long id) {
        return updateTeamPostStatus(id, TeamPost.PostStatus.ACTIVE);
    }
    
    @Override
    public Map<String, Object> getTeamPostStatistics(Long userId) {
        log.debug("Getting team post statistics for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPosts", teamPostRepository.countByUser(user));
        stats.put("activePosts", teamPostRepository.countByUserAndStatus(user, TeamPost.PostStatus.ACTIVE));
        stats.put("fullPosts", teamPostRepository.countByUserAndStatus(user, TeamPost.PostStatus.FULL));
        stats.put("cancelledPosts", teamPostRepository.countByUserAndStatus(user, TeamPost.PostStatus.CANCELLED));
        
        return stats;
    }
    
    @Override
    public List<TeamPostDto> getUpcomingTeamPosts(Long userId) {
        log.debug("Getting upcoming team posts for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
        
        LocalDateTime now = LocalDateTime.now();
        List<TeamPost> teamPosts = teamPostRepository.findUpcomingTeamPostsByUser(user, now);
        
        return teamPosts.stream().map(teamPostMapper::toDto).toList();
    }
    
    @Override
    public List<TeamPostDto> getPopularTeamPosts(int limit) {
        log.debug("Getting popular team posts");
        
        // Find team posts with most members (simplified)
        List<TeamPost> teamPosts = teamPostRepository.findPopularTeamPosts(
                TeamPost.PostStatus.ACTIVE, Pageable.ofSize(limit));
        
        return teamPosts.stream().map(teamPostMapper::toDto).toList();
    }
    
    @Override
    public boolean isTeamPostFull(Long teamPostId) {
        TeamPost teamPost = teamPostRepository.findById(teamPostId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        return teamPost.getCurrentPlayers() >= teamPost.getMaxPlayers();
    }
    
    @Override
    public boolean isUserInTeam(Long teamPostId, Long userId) {
        return teamMemberRepository.existsByTeamPostIdAndUserId(teamPostId, userId);
    }
    
    @Override
    public boolean canUserJoinTeam(Long teamPostId, Long userId) {
        TeamPost teamPost = teamPostRepository.findById(teamPostId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        // Check if team is open and not full
        if (teamPost.getStatus() != TeamPost.PostStatus.ACTIVE || 
            teamPost.getCurrentPlayers() >= teamPost.getMaxPlayers()) {
            return false;
        }
        
        // Check if user is not already in team
        return !isUserInTeam(teamPostId, userId);
    }
    
    @Override
    @Transactional
    public TeamMemberDto sendMessageAndJoinRequest(Long teamPostId, String messageContent) {
        log.debug("Sending message and join request for team post: {}", teamPostId);
        
        TeamPost teamPost = teamPostRepository.findById(teamPostId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.TEAM_POST_NOT_FOUND));
        
        User currentUser = getCurrentUser();
        
        // Validate join request first
        validateJoinRequest(teamPost, currentUser);
        
        // Create and save message
        Message message = Message.builder()
                .sender(currentUser)
                .receiver(teamPost.getUser())
                .content(messageContent)
                .messageType(Message.MessageType.TEXT)
                .relatedPost(teamPost)
                .isRead(false)
                .build();
        
        messageRepository.save(message);
        
        // Create team member with PENDING status
        TeamMember teamMember = TeamMember.builder()
                .teamPost(teamPost)
                .user(currentUser)
                .status(TeamMember.MemberStatus.PENDING)
                .build();
        
        TeamMember savedMember = teamMemberRepository.save(teamMember);
        
        log.info("User {} sent message and join request for team post {}", currentUser.getId(), teamPostId);
        return teamMemberMapper.toDto(savedMember);
    }
    
    // Private helper methods
    
    private User getCurrentUser() {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
    }
    
    private void validateTeamPostRequest(CreateTeamPostRequest request) {
        // Validate play date is in the future
        if (request.getPlayDate().isBefore(LocalDateTime.now())) {
            throw new ValidationException(ErrorConstants.PLAY_DATE_PAST);
        }
        
        // Validate max players
        if (request.getMaxPlayers() < 2) {
            throw new ValidationException(ErrorConstants.MIN_PLAYERS_REQUIRED);
        }
    }
    
    private void validateJoinRequest(TeamPost teamPost, User user) {
        // Check if team is open
        if (teamPost.getStatus() != TeamPost.PostStatus.ACTIVE) {
            throw new ValidationException(ErrorConstants.TEAM_POST_CLOSED);
        }
        
        // Check if team is full
        if (teamPost.getCurrentPlayers() >= teamPost.getMaxPlayers()) {
            throw new ValidationException(ErrorConstants.TEAM_FULL);
        }
        
        // Check if user is already in team
        if (isUserInTeam(teamPost.getId(), user.getId())) {
            throw new ValidationException(ErrorConstants.USER_ALREADY_IN_TEAM);
        }
        
        // Check if user is the creator
        if (teamPost.getUser().getId().equals(user.getId())) {
            throw new ValidationException(ErrorConstants.CREATOR_CANNOT_JOIN);
        }
    }
    
    private Specification<TeamPost> createTeamPostSpecification(String keyword, String sport, 
                                                               String skillLevel, String location, String date) {
        return (root, query, criteriaBuilder) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            
            // Only show active posts
            predicates.add(criteriaBuilder.equal(root.get("status"), TeamPost.PostStatus.ACTIVE));
            
            // Keyword search in title and description
            if (keyword != null && !keyword.trim().isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                var titlePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")), likePattern);
                var descPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), likePattern);
                predicates.add(criteriaBuilder.or(titlePredicate, descPredicate));
            }
            
            // Skill level filter
            if (skillLevel != null && !skillLevel.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("skillLevel")), 
                        "%" + skillLevel.toLowerCase() + "%"));
            }
            
            // Location filter
            if (location != null && !location.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("location")), 
                        "%" + location.toLowerCase() + "%"));
            }
            
            // Date filter
            if (date != null && !date.trim().isEmpty()) {
                try {
                    LocalDateTime startDate = LocalDateTime.parse(date + "T00:00:00");
                    LocalDateTime endDate = startDate.plusDays(1);
                    predicates.add(criteriaBuilder.between(root.get("playDate"), startDate, endDate));
                } catch (Exception e) {
                    log.warn("Invalid date format: {}", date);
                }
            }
            
            query.orderBy(criteriaBuilder.desc(root.get("createdAt")));
            
            return criteriaBuilder.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
} 