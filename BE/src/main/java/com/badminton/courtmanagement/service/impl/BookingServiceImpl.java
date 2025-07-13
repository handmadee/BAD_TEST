package com.badminton.courtmanagement.service.impl;

import com.badminton.courtmanagement.constants.ErrorConstants;
import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.Booking;
import com.badminton.courtmanagement.entity.Court;
import com.badminton.courtmanagement.entity.User;
import com.badminton.courtmanagement.exception.ResourceNotFoundException;
import com.badminton.courtmanagement.exception.ValidationException;
import com.badminton.courtmanagement.mapper.BookingMapper;
import com.badminton.courtmanagement.repository.BookingRepository;
import com.badminton.courtmanagement.repository.CourtRepository;
import com.badminton.courtmanagement.repository.UserRepository;
import com.badminton.courtmanagement.service.BookingService;
import com.badminton.courtmanagement.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {
    
    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    
    @Override
    @Transactional
    public BookingDto createBooking(CreateBookingRequest request) {
        log.debug("Creating new booking for court: {}", request.getCourtId());
        
        // Validate court exists and is active
        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND));
        
        if (court.getStatus() != Court.CourtStatus.ACTIVE) {
            throw new ValidationException(ErrorConstants.COURT_INACTIVE);
        }
        
        // Get current user
        User user = getCurrentUser();
        
        // Validate booking time
        validateBookingTime(request);
        
        // Check for conflicts
        if (hasBookingConflict(request.getCourtId(), request.getBookingDate(), 
                               request.getStartTime(), request.getEndTime())) {
            throw new ValidationException(ErrorConstants.BOOKING_CONFLICT);
        }
        
        // Create booking entity
        Booking booking = bookingMapper.toEntity(request);
        booking.setUser(user);
        booking.setCourt(court);
        booking.setStatus(Booking.BookingStatus.PENDING);
        
        // Save booking
        Booking savedBooking = bookingRepository.save(booking);
        log.info("Created booking with id: {}", savedBooking.getId());
        
        return bookingMapper.toDto(savedBooking);
    }
    
    @Override
    public BookingDto getBookingById(Long bookingId) {
        log.debug("Getting booking by id: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.BOOKING_NOT_FOUND));
        
        // Check access permission
        validateBookingAccess(booking);
        
        return bookingMapper.toDto(booking);
    }
    
    @Override
    public PageResponse<BookingDto> getMyBookings(Pageable pageable) {
        log.debug("Getting my bookings");
        
        User user = getCurrentUser();
        Page<Booking> bookings = bookingRepository.findByUser(user, pageable);
        
        return PageResponse.of(bookings.map(bookingMapper::toDto));
    }
    
    @Override
    public PageResponse<BookingDto> getBookingsByUser(Long userId, Pageable pageable) {
        log.debug("Getting bookings by user id: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
        
        Page<Booking> bookings = bookingRepository.findByUser(user, pageable);
        
        return PageResponse.of(bookings.map(bookingMapper::toDto));
    }
    
    @Override
    public PageResponse<BookingDto> getBookingsByCourt(Long courtId, Pageable pageable) {
        log.debug("Getting bookings by court id: {}", courtId);
        
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND));
        
        Page<Booking> bookings = bookingRepository.findByCourt(court, pageable);
        
        return PageResponse.of(bookings.map(bookingMapper::toDto));
    }
    
    @Override
    public PageResponse<BookingDto> getBookingsByOwner(Long ownerId, Pageable pageable) {
        log.debug("Getting bookings by owner id: {}", ownerId);
        
        LocalDate startDate = LocalDate.now().minusYears(1); // Last year
        LocalDate endDate = LocalDate.now().plusDays(30); // Next month
        Page<Booking> bookings = bookingRepository.findByCourtOwnerAndDateRange(ownerId, startDate, endDate, pageable);
        
        return PageResponse.of(bookings.map(bookingMapper::toDto));
    }
    
    @Override
    @Transactional
    public BookingDto updateBookingStatus(Long bookingId, Booking.BookingStatus status) {
        log.debug("Updating booking {} status to: {}", bookingId, status);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.BOOKING_NOT_FOUND));
        
        // Validate status transition
        validateStatusTransition(booking.getStatus(), status);
        
        booking.setStatus(status);
        Booking savedBooking = bookingRepository.save(booking);
        
        log.info("Updated booking {} status to: {}", bookingId, status);
        return bookingMapper.toDto(savedBooking);
    }
    
    @Override
    @Transactional
    public BookingDto cancelBooking(Long bookingId) {
        log.debug("Cancelling booking id: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.BOOKING_NOT_FOUND));
        
        // Check if booking can be cancelled
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED ||
            booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new ValidationException(ErrorConstants.BOOKING_CANNOT_CANCEL);
        }
        
        // Check access permission
        validateBookingAccess(booking);
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);
        
        log.info("Cancelled booking id: {}", bookingId);
        return bookingMapper.toDto(savedBooking);
    }
    
    @Override
    @Transactional
    public BookingDto confirmBooking(Long bookingId) {
        log.debug("Confirming booking id: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
        }
        
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking savedBooking = bookingRepository.save(booking);
        
        log.info("Confirmed booking id: {}", bookingId);
        return bookingMapper.toDto(savedBooking);
    }
    
    @Override
    @Transactional
    public BookingDto completeBooking(Long bookingId) {
        log.debug("Completing booking id: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
        }
        
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        Booking savedBooking = bookingRepository.save(booking);
        
        log.info("Completed booking id: {}", bookingId);
        return bookingMapper.toDto(savedBooking);
    }
    
    @Override
    public List<BookingDto> getUpcomingBookings(Long userId) {
        log.debug("Getting upcoming bookings for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
        
        LocalDate today = LocalDate.now();
        LocalTime currentTime = LocalTime.now();
        LocalTime endTime = LocalTime.of(23, 59);
        List<Booking> bookings = bookingRepository.findUpcomingBookings(today, currentTime, endTime);
        
        // Filter by user
        List<Booking> userBookings = bookings.stream()
                .filter(booking -> booking.getUser().getId().equals(userId))
                .toList();
        
        return bookingMapper.toDtoList(userBookings);
    }
    
    @Override
    public PageResponse<BookingDto> getOverdueBookings(Pageable pageable) {
        log.debug("Getting overdue bookings");
        
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24); // 24 hours ago
        List<Booking> bookings = bookingRepository.findOverdueBookings(cutoffTime);
        
        // Convert to Page manually (simplified implementation)
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), bookings.size());
        List<Booking> pageContent = bookings.subList(start, end);
        
        return PageResponse.of(pageContent.stream().map(bookingMapper::toDto).toList(), 
                              pageable.getPageNumber(), 
                              pageable.getPageSize(), 
                              bookings.size());
    }
    
    @Override
    public Map<String, Object> getBookingStatistics(Long courtId) {
        log.debug("Getting booking statistics for court: {}", courtId);
        
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND));
        
        // Simple statistics implementation
        Map<String, Object> stats = new HashMap<>();
        stats.put("courtId", courtId);
        stats.put("courtName", court.getName());
        
        Page<Booking> allBookingsPage = bookingRepository.findByCourt(court, Pageable.unpaged());
        List<Booking> allBookings = allBookingsPage.getContent();
        stats.put("totalBookings", allBookings.size());
        
        long confirmedBookings = allBookings.stream()
                .mapToLong(booking -> booking.getStatus() == Booking.BookingStatus.CONFIRMED ? 1 : 0)
                .sum();
        stats.put("confirmedBookings", confirmedBookings);
        
        long completedBookings = allBookings.stream()
                .mapToLong(booking -> booking.getStatus() == Booking.BookingStatus.COMPLETED ? 1 : 0)
                .sum();
        stats.put("completedBookings", completedBookings);
        
        return stats;
    }
    
    @Override
    public Map<String, Object> getRevenueStatistics(Long ownerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.debug("Getting revenue statistics for owner: {} from {} to {}", ownerId, startDate, endDate);
        
        // Simple revenue statistics implementation
        Map<String, Object> stats = new HashMap<>();
        stats.put("ownerId", ownerId);
        stats.put("startDate", startDate);
        stats.put("endDate", endDate);
        stats.put("totalRevenue", 0); // Placeholder
        stats.put("monthlyRevenue", 0); // Placeholder
        
        return stats;
    }
    
    private User getCurrentUser() {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
    }
    
    private void validateBookingTime(CreateBookingRequest request) {
        // Check if booking date is in the past
        if (request.getBookingDate().isBefore(java.time.LocalDate.now())) {
            throw new ValidationException(ErrorConstants.BOOKING_PAST_DATE);
        }
        
        // Check if start time is before end time
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new ValidationException(ErrorConstants.BOOKING_INVALID_TIME);
        }
    }
    
    private boolean hasBookingConflict(Long courtId, LocalDate bookingDate, 
                                     LocalTime startTime, LocalTime endTime) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND));
        
        long conflictCount = bookingRepository.countConflictingBookings(court, bookingDate, startTime, endTime);
        
        return conflictCount > 0;
    }
    

    private void validateBookingAccess(Booking booking) {
        User currentUser = getCurrentUser();
        
        // User can access their own bookings, court owners can access bookings for their courts, admins can access all
        if (!booking.getUser().getId().equals(currentUser.getId()) &&
            !booking.getCourt().getOwner().getUser().getId().equals(currentUser.getId()) &&
            !SecurityUtils.hasRole("ADMIN")) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
    }
    
    private void validateStatusTransition(Booking.BookingStatus currentStatus, Booking.BookingStatus newStatus) {
        // Simple validation - in real app, you'd have more complex business rules
        if (currentStatus == Booking.BookingStatus.CANCELLED || 
            currentStatus == Booking.BookingStatus.COMPLETED) {
            throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
        }
    }
} 