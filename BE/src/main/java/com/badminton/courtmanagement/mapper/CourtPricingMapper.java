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
    CourtPricingDto toDto(CourtPricing courtPricing);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "court", ignore = true)
    CourtPricing toEntity(CreateCourtPricingRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "court", ignore = true)
    CourtPricing toEntity(CourtPricingDto dto);
    
    List<CourtPricingDto> toDtoList(List<CourtPricing> courtPricings);
} 