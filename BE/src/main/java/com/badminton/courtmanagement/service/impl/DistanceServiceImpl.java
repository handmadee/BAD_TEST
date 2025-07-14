package com.badminton.courtmanagement.service.impl;

import com.badminton.courtmanagement.service.DistanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class DistanceServiceImpl implements DistanceService {

    @Override
    @Cacheable(value = "distance", key = "#lat1 + '_' + #lon1 + '_' + #lat2 + '_' + #lon2")
    public Double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        return calculateDistance(lat1.doubleValue(), lon1.doubleValue(), lat2.doubleValue(), lon2.doubleValue());
    }

    @Override
    @Cacheable(value = "distance", key = "#lat1 + '_' + #lon1 + '_' + #lat2 + '_' + #lon2")
    public Double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        log.debug("Calculating distance between ({}, {}) and ({}, {})", lat1, lon1, lat2, lon2);
        
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c; // Distance in km
        
        double result = Math.round(distance * 100.0) / 100.0; // Round to 2 decimal places
        log.debug("Calculated distance: {} km", result);
        
        return result;
    }

    @Override
    @CacheEvict(value = "distance", allEntries = true)
    public void clearDistanceCache() {
        log.info("Clearing distance cache");
    }
} 