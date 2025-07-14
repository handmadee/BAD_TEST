package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.UserDto;
import com.badminton.courtmanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    
    @Mapping(target = "profileImage", source = "avatarUrl")
    UserDto toDto(User user);
    
    @Mapping(target = "favorites", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "teamMemberships", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "avatarUrl", source = "profileImage")
    @Mapping(target = "bio", ignore = true)
    @Mapping(target = "location", ignore = true)
    @Mapping(target = "skillLevel", ignore = true)
    @Mapping(target = "preferredSports", ignore = true)
    @Mapping(target = "emailVerified", ignore = true)
    @Mapping(target = "lastLogin", ignore = true)
    @Mapping(target = "sentMessages", ignore = true)
    @Mapping(target = "receivedMessages", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    User toEntity(UserDto userDto);
    
    List<UserDto> toDtoList(List<User> users);
} 