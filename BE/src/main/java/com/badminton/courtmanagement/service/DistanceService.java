package com.badminton.courtmanagement.service;

import java.math.BigDecimal;

public interface DistanceService {
    
    /**
     * Calculate distance between two points with Redis caching
     * @param lat1 Latitude of first point
     * @param lon1 Longitude of first point  
     * @param lat2 Latitude of second point
     * @param lon2 Longitude of second point
     * @return Distance in kilometers
     */
    Double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2);
    
    /**
     * Calculate distance using double values with caching
     */
    Double calculateDistance(double lat1, double lon1, double lat2, double lon2);
    
    /**
     * Clear distance cache
     */
    void clearDistanceCache();
} 