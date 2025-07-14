package com.badminton.courtmanagement.mapper;

import com.badminton.courtmanagement.dto.CreateMessageRequest;
import com.badminton.courtmanagement.dto.MessageDto;
import com.badminton.courtmanagement.entity.Message;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", 
        uses = {UserMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MessageMapper {
    
    @Mapping(target = "relatedCourtId", source = "relatedCourt.id")
    @Mapping(target = "relatedBookingId", source = "relatedBooking.id")
    @Mapping(target = "relatedPostId", source = "relatedPost.id")
    MessageDto toDto(Message message);
    
    List<MessageDto> toDtoList(List<Message> messages);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sender", ignore = true)
    @Mapping(target = "receiver", ignore = true)
    @Mapping(target = "relatedCourt", ignore = true)
    @Mapping(target = "relatedBooking", ignore = true)
    @Mapping(target = "relatedPost", ignore = true)
    @Mapping(target = "isRead", ignore = true)
    @Mapping(target = "readAt", ignore = true)
    Message toEntity(CreateMessageRequest request);
} 