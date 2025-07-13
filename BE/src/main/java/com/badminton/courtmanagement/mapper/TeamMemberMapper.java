package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.TeamMemberDto;
import com.badminton.courtmanagement.entity.TeamMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", 
        uses = {UserMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TeamMemberMapper {
    
    @Mapping(target = "teamPostId", source = "teamPost.id")
    @Mapping(target = "joinedAt", source = "createdAt")
    TeamMemberDto toDto(TeamMember teamMember);
    
    List<TeamMemberDto> toDtoList(List<TeamMember> teamMembers);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "teamPost", ignore = true)
    @Mapping(target = "user", ignore = true)
    TeamMember toEntity(TeamMemberDto dto);
} 