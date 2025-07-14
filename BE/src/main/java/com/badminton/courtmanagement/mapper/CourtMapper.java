package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.CourtDto;
import com.badminton.courtmanagement.dto.CreateCourtRequest;
import com.badminton.courtmanagement.entity.Court;
import org.mapstruct.*;

import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CourtMapper {
    
    @Mapping(target = "images", source = "images", qualifiedByName = "stringToList")
    @Mapping(target = "distance", ignore = true)
    @Mapping(target = "price", ignore = true)
    @Mapping(target = "operatingHours", ignore = true)
    @Mapping(target = "owner", ignore = true) // Ignore owner to avoid circular dependency
    @Mapping(target = "pricings", ignore = true) // Ignore pricings to avoid circular dependency
    CourtDto toDto(Court court);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "pricings", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "favorites", ignore = true)
    @Mapping(target = "images", source = "images", qualifiedByName = "listToString")
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "district", ignore = true)
    @Mapping(target = "totalCourts", ignore = true)
    @Mapping(target = "openingTime", ignore = true)
    @Mapping(target = "closingTime", ignore = true)
    @Mapping(target = "featured", ignore = true)
    @Mapping(target = "coverImage", ignore = true)
    Court toEntity(CreateCourtRequest request);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "totalReviews", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "pricings", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "reviews", ignore = true)
    @Mapping(target = "favorites", ignore = true)
    @Mapping(target = "images", source = "images", qualifiedByName = "listToString")
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "district", ignore = true)
    @Mapping(target = "totalCourts", ignore = true)
    @Mapping(target = "openingTime", ignore = true)
    @Mapping(target = "closingTime", ignore = true)
    @Mapping(target = "featured", ignore = true)
    @Mapping(target = "coverImage", ignore = true)
    void updateEntityFromRequest(CreateCourtRequest request, @MappingTarget Court court);
    
    List<CourtDto> toDtoList(List<Court> courts);
    
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