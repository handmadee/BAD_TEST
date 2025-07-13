package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.BookingDto;
import com.badminton.courtmanagement.dto.CreateBookingRequest;
import com.badminton.courtmanagement.entity.Booking;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class, CourtMapper.class})
public interface BookingMapper {
    
    BookingDto toDto(Booking booking);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "court", ignore = true)
    @Mapping(target = "status", ignore = true)
    Booking toEntity(CreateBookingRequest request);
    
    List<BookingDto> toDtoList(List<Booking> bookings);
} 