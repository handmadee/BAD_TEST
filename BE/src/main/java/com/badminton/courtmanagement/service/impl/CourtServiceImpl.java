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
import com.badminton.courtmanagement.service.DistanceService;
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
    private final DistanceService distanceService;
    
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
    public CourtDto createCourtAsAdmin(CreateCourtRequest request) {
        log.debug("Admin creating new court: {}", request.getName());
        
        // Validate request
        validateCourtRequest(request);
        
        // For admin-created courts, we need a default court owner or create one
        // Let's create a system court owner if none exists
        CourtOwner systemOwner = getOrCreateSystemCourtOwner();
        
        // Convert to entity
        Court court = courtMapper.toEntity(request);
        court.setOwner(systemOwner);
        court.setStatus(Court.CourtStatus.ACTIVE);
        
        // Save court
        Court savedCourt = courtRepository.save(court);
        log.info("Admin created court with id: {}", savedCourt.getId());
        
        return courtMapper.toDto(savedCourt);
    }
    
    private CourtOwner getOrCreateSystemCourtOwner() {
        // Try to find existing system court owner
        return courtOwnerRepository.findByUserEmail("system@badminton.com")
                .orElseGet(() -> {
                    // Create system user if not exists
                    User systemUser = userRepository.findByEmail("system@badminton.com")
                            .orElseGet(() -> {
                                User user = User.builder()
                                        .username("system")
                                        .email("system@badminton.com")
                                        .fullName("System Administrator")
                                        .password("N/A") // Won't be used for login
                                        .role(User.UserRole.COURT_OWNER)
                                        .status(User.UserStatus.ACTIVE)
                                        .emailVerified(true)
                                        .build();
                                return userRepository.save(user);
                            });
                    
                    // Create court owner profile
                    CourtOwner owner = CourtOwner.builder()
                            .user(systemUser)
                            .businessName("System Courts")
                            .businessEmail("system@badminton.com")
                            .description("Courts created by system administrator")
                            .verificationStatus(CourtOwner.VerificationStatus.VERIFIED)
                            .build();
                    
                    return courtOwnerRepository.save(owner);
                });
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
        log.debug("Searching courts with keyword: {}, sportType: {}, minRating: {}, location: ({}, {})", 
                 keyword, sportType, minRating, latitude, longitude);
        
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
        
        // Only active courts
        spec = spec.and(CourtSpecification.hasStatus(Court.CourtStatus.ACTIVE));
        
        // Get all courts that match criteria (without pagination first if we need to sort by distance)
        List<Court> allCourts;
        if (latitude != null && longitude != null) {
            // Get all courts to calculate distance and sort
            allCourts = courtRepository.findAll(spec);
            
            // Calculate distances and filter by radius if specified
            List<CourtDto> courtsWithDistance = allCourts.stream()
                .map(court -> {
                    CourtDto dto = courtMapper.toDto(court);
                    
                    // Set distance
                    if (court.getLatitude() != null && court.getLongitude() != null) {
                        Double distance = distanceService.calculateDistance(
                            latitude, longitude,
                            court.getLatitude(), court.getLongitude()
                        );
                        dto.setDistance(distance);
                    } else {
                        dto.setDistance(null);
                    }
                    
                    // Set price from court pricings (get minimum price)
                    if (court.getPricings() != null && !court.getPricings().isEmpty()) {
                        BigDecimal minPrice = court.getPricings().stream()
                            .map(pricing -> pricing.getBasePrice())
                            .min(BigDecimal::compareTo)
                            .orElse(null);
                        dto.setPrice(minPrice);
                    }
                    
                    return dto;
                })
                .filter(dto -> {
                    // Filter by radius if specified
                    if (radiusKm != null && dto.getDistance() != null) {
                        return dto.getDistance() <= radiusKm;
                    }
                    return true;
                })
                .sorted((c1, c2) -> {
                    // Sort by distance (closest first)
                    if (c1.getDistance() == null && c2.getDistance() == null) return 0;
                    if (c1.getDistance() == null) return 1;
                    if (c2.getDistance() == null) return -1;
                    return Double.compare(c1.getDistance(), c2.getDistance());
                })
                .toList();
            
            // Manual pagination after sorting by distance
            int start = pageable.getPageNumber() * pageable.getPageSize();
            int end = Math.min(start + pageable.getPageSize(), courtsWithDistance.size());
            
            List<CourtDto> pageContent = start < courtsWithDistance.size() 
                ? courtsWithDistance.subList(start, end) 
                : List.of();
            
            return PageResponse.of(
                pageContent,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                courtsWithDistance.size()
            );
        } else {
            // No location provided, use normal pagination
            Page<Court> courts = courtRepository.findAll(spec, pageable);
            return PageResponse.of(courts.map(courtMapper::toDto));
        }
    }
    
    @Override
    public List<CourtDto> getNearbyCourtsByRadius(BigDecimal latitude, BigDecimal longitude, Double radiusKm) {
        log.info("Finding courts within {}km of coordinates ({}, {})", radiusKm, latitude, longitude);
        
        // Get all active courts and filter by distance
        List<Court> courts = courtRepository.findAllActiveCourts().stream()
            .filter(court -> {
                if (court.getLatitude() == null || court.getLongitude() == null) {
                    return false;
                }
                // Calculate distance using cached service
                double distance = distanceService.calculateDistance(
                    latitude.doubleValue(), longitude.doubleValue(),
                    court.getLatitude().doubleValue(), court.getLongitude().doubleValue()
                );
                return distance <= radiusKm;
            })
            .toList();
        
        return courts.stream()
            .map(court -> {
                CourtDto dto = courtMapper.toDto(court);
                
                // Calculate and set distance using cached service
                if (court.getLatitude() != null && court.getLongitude() != null) {
                    double distance = distanceService.calculateDistance(
                        latitude.doubleValue(), longitude.doubleValue(),
                        court.getLatitude().doubleValue(), court.getLongitude().doubleValue()
                    );
                    dto.setDistance(distance);
                } else {
                    dto.setDistance(null);
                }
                
                // Set price from court pricings (get minimum price)
                if (court.getPricings() != null && !court.getPricings().isEmpty()) {
                    BigDecimal minPrice = court.getPricings().stream()
                        .map(pricing -> pricing.getBasePrice())
                        .min(BigDecimal::compareTo)
                        .orElse(null);
                    dto.setPrice(minPrice);
                }
                
                return dto;
            })
            .toList();
    }
    
    /**
     * Calculate distance between two points using Haversine formula
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point  
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @return Distance in kilometers
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c; // Distance in km
        
        return Math.round(distance * 100.0) / 100.0; // Round to 2 decimal places
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