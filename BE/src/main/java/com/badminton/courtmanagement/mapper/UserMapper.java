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
    
    UserDto toDto(User user);
    @Mapping(target = "favorites", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "teamMemberships", ignore = true)
    User toEntity(UserDto userDto);
    
    List<UserDto> toDtoList(List<User> users);
} 