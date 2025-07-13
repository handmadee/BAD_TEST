package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.CourtOwnerDto;
import com.badminton.courtmanagement.entity.CourtOwner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface CourtOwnerMapper {
    
    CourtOwnerDto toDto(CourtOwner courtOwner);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "courts", ignore = true)
    CourtOwner toEntity(CourtOwnerDto courtOwnerDto);
    
    List<CourtOwnerDto> toDtoList(List<CourtOwner> courtOwners);
} 