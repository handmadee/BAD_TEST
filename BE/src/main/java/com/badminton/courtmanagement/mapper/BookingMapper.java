package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.BookingDto;
import com.badminton.courtmanagement.dto.CreateBookingRequest;
import com.badminton.courtmanagement.entity.Booking;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    
    @Mapping(target = "user", ignore = true) // Ignore user to avoid circular dependency
    @Mapping(target = "court", ignore = true) // Ignore court to avoid circular dependency
    BookingDto toDto(Booking booking);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "court", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "vietqrUrl", ignore = true)
    @Mapping(target = "discountUsages", ignore = true)
    @Mapping(target = "transactions", ignore = true)
    Booking toEntity(CreateBookingRequest request);
    
    List<BookingDto> toDtoList(List<Booking> bookings);
} 