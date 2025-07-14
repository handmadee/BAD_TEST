package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.CreateTeamPostRequest;
import com.badminton.courtmanagement.dto.TeamPostDto;
import com.badminton.courtmanagement.entity.TeamPost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring", 
        uses = {UserMapper.class, TeamMemberMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TeamPostMapper {
    
    @Mapping(target = "isFull", expression = "java(teamPost.getCurrentPlayers() >= teamPost.getMaxPlayers())")
    @Mapping(target = "canJoin", expression = "java(teamPost.getCurrentPlayers() < teamPost.getMaxPlayers() && teamPost.getStatus() == com.badminton.courtmanagement.entity.TeamPost.PostStatus.ACTIVE)")
    @Mapping(target = "availableSlots", expression = "java(teamPost.getMaxPlayers() - teamPost.getCurrentPlayers())")
    @Mapping(target = "images", source = "images", qualifiedByName = "stringToList")
    TeamPostDto toDto(TeamPost teamPost);
    
    List<TeamPostDto> toDtoList(List<TeamPost> teamPosts);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "images", source = "images", qualifiedByName = "listToString")
    TeamPost toEntity(CreateTeamPostRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "images", source = "images", qualifiedByName = "listToString")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(CreateTeamPostRequest request, @MappingTarget TeamPost teamPost);
    
    // Custom mapping for images
    @Named("stringToList")
    default List<String> stringToList(String images) {
        if (images == null || images.trim().isEmpty()) {
            return null;
        }
        return Arrays.asList(images.split(","));
    }
    
    @Named("listToString")
    default String listToString(List<String> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        return String.join(",", images);
    }
} 