package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.CourtPricingDto;
import com.badminton.courtmanagement.dto.CreateCourtPricingRequest;
import com.badminton.courtmanagement.entity.CourtPricing;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CourtPricingMapper {
    
    @Mapping(target = "courtId", source = "court.id")
    @Mapping(target = "dayOfWeek", ignore = true)
    @Mapping(target = "price", source = "basePrice")
    @Mapping(target = "priceType", ignore = true)
    @Mapping(target = "description", ignore = true)
    CourtPricingDto toDto(CourtPricing courtPricing);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "court", ignore = true)
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "dayType", ignore = true)
    @Mapping(target = "basePrice", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    CourtPricing toEntity(CreateCourtPricingRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "court", ignore = true)
    @Mapping(target = "name", ignore = true)
    @Mapping(target = "dayType", ignore = true)
    @Mapping(target = "basePrice", ignore = true)
    @Mapping(target = "currency", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    CourtPricing toEntity(CourtPricingDto dto);
    
    List<CourtPricingDto> toDtoList(List<CourtPricing> courtPricings);
} 