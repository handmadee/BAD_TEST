package com.badminton.courtmanagement.service.impl;

import com.badminton.courtmanagement.constants.ErrorConstants;
import com.badminton.courtmanagement.dto.*;
import com.badminton.courtmanagement.entity.Court;
import com.badminton.courtmanagement.entity.CourtOwner;
import com.badminton.courtmanagement.entity.User;
import com.badminton.courtmanagement.exception.ResourceNotFoundException;
import com.badminton.courtmanagement.exception.ValidationException;
import com.badminton.courtmanagement.mapper.CourtMapper;
import com.badminton.courtmanagement.repository.CourtOwnerRepository;
import com.badminton.courtmanagement.repository.CourtRepository;
import com.badminton.courtmanagement.repository.UserRepository;
import com.badminton.courtmanagement.service.CourtService;
import com.badminton.courtmanagement.specification.CourtSpecification;
import com.badminton.courtmanagement.utils.SecurityUtils;
import com.badminton.courtmanagement.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CourtServiceImpl implements CourtService {
    
    private final CourtRepository courtRepository;
    private final CourtOwnerRepository courtOwnerRepository;
    private final UserRepository userRepository;
    private final CourtMapper courtMapper;
    
    @Override
    public PageResponse<CourtDto> getAllCourts(Pageable pageable) {
        log.debug("Getting all courts with pagination: {}", pageable);
        
        Page<Court> courts = courtRepository.findAll(pageable);
        List<CourtDto> courtDtos = courtMapper.toDtoList(courts.getContent());
        
        return PageResponse.of(courts.map(courtMapper::toDto));
    }
    
    @Override
    public CourtDto getCourtById(Long id) {
        log.debug("Getting court by id: {}", id);
        
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND, id));
        
        return courtMapper.toDto(court);
    }
    
    @Override
    @Transactional
    public CourtDto createCourt(CreateCourtRequest request) {
        log.debug("Creating new court: {}", request.getName());
        
        // Validate request
        validateCourtRequest(request);
        
        // Get current user as owner
        Long currentUserId = getCurrentUserId();
        CourtOwner owner = courtOwnerRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ValidationException(ErrorConstants.COURT_OWNER_NOT_FOUND));
        
        // Convert to entity
        Court court = courtMapper.toEntity(request);
        court.setOwner(owner);
        court.setStatus(Court.CourtStatus.ACTIVE);
        
        // Save court
        Court savedCourt = courtRepository.save(court);
        log.info("Created court with id: {}", savedCourt.getId());
        
        return courtMapper.toDto(savedCourt);
    }
    
    @Override
    @Transactional
    public CourtDto updateCourt(Long id, CreateCourtRequest request) {
        log.debug("Updating court id: {}", id);
        
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND, id));
        
        // Check ownership
        validateCourtOwnership(court);
        
        // Validate request
        validateCourtRequest(request);
        
        // Update entity
        courtMapper.updateEntityFromRequest(request, court);
        
        Court savedCourt = courtRepository.save(court);
        log.info("Updated court id: {}", id);
        
        return courtMapper.toDto(savedCourt);
    }
    
    @Override
    @Transactional
    public void deleteCourt(Long id) {
        log.debug("Deleting court id: {}", id);
        
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND, id));
        
        // Check ownership
        validateCourtOwnership(court);
        
        // Soft delete by setting status
        court.setStatus(Court.CourtStatus.INACTIVE);
        courtRepository.save(court);
        
        log.info("Deleted court id: {}", id);
    }
    
    @Override
    public PageResponse<CourtDto> searchCourts(String keyword, String sportType, 
                                               BigDecimal minRating, BigDecimal latitude, 
                                               BigDecimal longitude, Double radiusKm, 
                                               Pageable pageable) {
        log.debug("Searching courts with keyword: {}, sportType: {}, minRating: {}", 
                 keyword, sportType, minRating);
        
        Specification<Court> spec = Specification.where(null);
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            spec = spec.and(CourtSpecification.searchByKeyword(keyword.trim()));
        }
        
        if (sportType != null && !sportType.trim().isEmpty()) {
            spec = spec.and(CourtSpecification.hasSportType(sportType.trim()));
        }
        
        if (minRating != null) {
            spec = spec.and(CourtSpecification.hasRatingBetween(minRating, null));
        }
        
        if (latitude != null && longitude != null && radiusKm != null) {
            // For now, we'll use bounding box approximation instead of radius
            // This is a simplified implementation
            BigDecimal delta = BigDecimal.valueOf(radiusKm / 111.0); // Rough km to degree conversion
            spec = spec.and(CourtSpecification.withinBounds(
                latitude.subtract(delta), latitude.add(delta),
                longitude.subtract(delta), longitude.add(delta)
            ));
        }
        
        // Only active courts
        spec = spec.and(CourtSpecification.hasStatus(Court.CourtStatus.ACTIVE));
        
        Page<Court> courts = courtRepository.findAll(spec, pageable);
        
        return PageResponse.of(courts.map(courtMapper::toDto));
    }
    
    @Override
    public List<CourtDto> getNearbyCourtsByRadius(BigDecimal latitude, BigDecimal longitude, Double radiusKm) {
        log.debug("Getting nearby courts at ({}, {}) within {} km", latitude, longitude, radiusKm);
        
        // Use native query for radius search
        List<Object[]> results = courtRepository.findCourtsWithinRadius(latitude, longitude, radiusKm, Court.CourtStatus.ACTIVE);
        
        // Convert Object[] results to Court entities (simplified implementation)
        List<Court> courts = courtRepository.findAllActiveCourts().stream()
            .filter(court -> {
                if (court.getLatitude() == null || court.getLongitude() == null) {
                    return false;
                }
                // Simple distance calculation (not accurate but functional)
                double distance = Math.sqrt(
                    Math.pow(court.getLatitude().subtract(latitude).doubleValue(), 2) +
                    Math.pow(court.getLongitude().subtract(longitude).doubleValue(), 2)
                ) * 111; // Rough conversion to km
                return distance <= radiusKm;
            })
            .toList();
        
        return courtMapper.toDtoList(courts);
    }
    
    @Override
    public PageResponse<CourtDto> getCourtsByOwner(Long ownerId, Pageable pageable) {
        log.debug("Getting courts by owner id: {}", ownerId);
        
        CourtOwner owner = courtOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_OWNER_NOT_FOUND));
        
        Page<Court> courts = courtRepository.findByOwner(owner, pageable);
        
        return PageResponse.of(courts.map(courtMapper::toDto));
    }
    
    @Override
    public PageResponse<CourtDto> getMyOwnedCourts(Pageable pageable) {
        log.debug("Getting courts owned by current user");
        
        Long currentUserId = getCurrentUserId();
        CourtOwner owner = courtOwnerRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ValidationException(ErrorConstants.COURT_OWNER_NOT_FOUND));
        
        return getCourtsByOwner(owner.getId(), pageable);
    }
    
    @Override
    @Transactional
    public CourtDto updateCourtStatus(Long id, Court.CourtStatus status) {
        log.debug("Updating court {} status to: {}", id, status);
        
        Court court = courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND, id));
        
        // Check ownership or admin role
        if (!SecurityUtils.hasRole("ADMIN")) {
            validateCourtOwnership(court);
        }
        
        court.setStatus(status);
        Court savedCourt = courtRepository.save(court);
        
        log.info("Updated court {} status to: {}", id, status);
        return courtMapper.toDto(savedCourt);
    }
    
    @Override
    public Map<String, Object> getCourtStatistics(Long courtId) {
        log.debug("Getting statistics for court: {}", courtId);
        
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND, courtId));
        
        // Check ownership
        validateCourtOwnership(court);
        
        // Simple statistics implementation
        Map<String, Object> stats = new HashMap<>();
        stats.put("courtId", courtId);
        stats.put("courtName", court.getName());
        stats.put("totalBookings", court.getBookings() != null ? court.getBookings().size() : 0);
        stats.put("averageRating", court.getAverageRating());
        stats.put("totalReviews", court.getTotalReviews());
        
        return stats;
    }
    
    @Override
    public Map<String, Object> getOwnerStatistics(Long ownerId) {
        log.debug("Getting statistics for owner: {}", ownerId);
        
        // Check ownership or admin role
        if (!SecurityUtils.hasRole("ADMIN")) {
            Long currentUserId = getCurrentUserId();
            CourtOwner owner = courtOwnerRepository.findByUserId(currentUserId)
                    .orElseThrow(() -> new ValidationException(ErrorConstants.COURT_OWNER_NOT_FOUND));
            
            if (!owner.getId().equals(ownerId)) {
                throw new ValidationException(ErrorConstants.ACCESS_DENIED);
            }
        }
        
        CourtOwner owner = courtOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_OWNER_NOT_FOUND));
        
        // Simple statistics implementation
        Map<String, Object> stats = new HashMap<>();
        stats.put("ownerId", ownerId);
        stats.put("totalCourts", owner.getCourts() != null ? owner.getCourts().size() : 0);
        stats.put("activeCourts", owner.getCourts() != null ? 
            owner.getCourts().stream().mapToInt(court -> 
                court.getStatus() == Court.CourtStatus.ACTIVE ? 1 : 0).sum() : 0);
        
        return stats;
    }
    
    @Override
    public boolean isCourtAvailable(Long courtId, LocalDateTime startTime, LocalDateTime endTime) {
        log.debug("Checking court {} availability from {} to {}", courtId, startTime, endTime);
        
        if (startTime.isAfter(endTime)) {
            throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
        }
        
        // Simple availability check - in real implementation, you would check against bookings
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.COURT_NOT_FOUND, courtId));
        
        return court.getStatus() == Court.CourtStatus.ACTIVE;
    }
    
    private void validateCourtRequest(CreateCourtRequest request) {
        if (!ValidationUtils.isValidEmail(request.getEmail())) {
            throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
        }
        
        if (request.getPhone() != null && !ValidationUtils.isValidPhone(request.getPhone())) {
            throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
        }
        
        if (request.getLatitude() != null && request.getLongitude() != null) {
            if (!ValidationUtils.isValidLatitude(request.getLatitude()) || 
                !ValidationUtils.isValidLongitude(request.getLongitude())) {
                throw new ValidationException(ErrorConstants.VALIDATION_ERROR);
            }
        }
    }
    
    private void validateCourtOwnership(Court court) {
        Long currentUserId = getCurrentUserId();
        if (!court.getOwner().getUser().getId().equals(currentUserId)) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
    }
    
    private Long getCurrentUserId() {
        String currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail == null) {
            throw new ValidationException(ErrorConstants.ACCESS_DENIED);
        }
        
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorConstants.USER_NOT_FOUND));
        
        return user.getId();
    }
} 