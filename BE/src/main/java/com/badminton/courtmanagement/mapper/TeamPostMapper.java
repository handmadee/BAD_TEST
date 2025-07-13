package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.CreateTeamPostRequest;
import com.badminton.courtmanagement.dto.TeamPostDto;
import com.badminton.courtmanagement.entity.TeamPost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", 
        uses = {UserMapper.class, TeamMemberMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TeamPostMapper {
    
    @Mapping(target = "isFull", expression = "java(teamPost.getCurrentPlayers() >= teamPost.getMaxPlayers())")
    @Mapping(target = "canJoin", expression = "java(teamPost.getCurrentPlayers() < teamPost.getMaxPlayers() && teamPost.getStatus() == com.badminton.courtmanagement.entity.TeamPost.PostStatus.OPEN)")
    @Mapping(target = "availableSlots", expression = "java(teamPost.getMaxPlayers() - teamPost.getCurrentPlayers())")
    TeamPostDto toDto(TeamPost teamPost);
    
    List<TeamPostDto> toDtoList(List<TeamPost> teamPosts);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "members", ignore = true)
    TeamPost toEntity(CreateTeamPostRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "members", ignore = true)
    void updateEntityFromRequest(CreateTeamPostRequest request, @MappingTarget TeamPost teamPost);
} 