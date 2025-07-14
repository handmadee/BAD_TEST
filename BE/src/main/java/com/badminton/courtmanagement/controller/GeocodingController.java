package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.core.ParameterizedTypeReference;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/geocoding")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Geocoding", description = "API geocoding và địa chỉ")
public class GeocodingController {
    
    private final RestTemplate restTemplate;
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    
    @GetMapping("/search")
    @Operation(summary = "Tìm tọa độ từ địa chỉ", description = "Geocoding địa chỉ thành latitude/longitude")
    public ApiResponse<Map<String, Object>> geocodeAddress(
            @Parameter(description = "Địa chỉ cần tìm tọa độ") @RequestParam String address) {
        
        try {
            log.info("Geocoding address: {}", address);
            
            // Build URL with proper encoding using UriComponentsBuilder
            String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_URL)
                    .queryParam("format", "json")
                    .queryParam("q", address)
                    .queryParam("limit", "1")
                    .queryParam("countrycodes", "vn")
                    .queryParam("addressdetails", "1")
                    .encode()
                    .toUriString();
            
            log.info("Geocoding URL: {}", url);
            
            // Add User-Agent header to comply with Nominatim usage policy
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "BadmintonCourtApp/1.0 (contact@badminton.com)");
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            // Make request with proper type handling
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    url, 
                    org.springframework.http.HttpMethod.GET, 
                    entity, 
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );
            
            List<Map<String, Object>> results = response.getBody();
            
            if (results != null && !results.isEmpty()) {
                Map<String, Object> result = results.get(0);
                
                Map<String, Object> geocodeResult = new HashMap<>();
                geocodeResult.put("latitude", Double.parseDouble(result.get("lat").toString()));
                geocodeResult.put("longitude", Double.parseDouble(result.get("lon").toString()));
                geocodeResult.put("display_name", result.get("display_name"));
                geocodeResult.put("address", result.get("address"));
                
                log.info("Geocoding successful for: {} -> ({}, {})", 
                        address, geocodeResult.get("latitude"), geocodeResult.get("longitude"));
                
                return ApiResponse.success(geocodeResult);
            } else {
                log.warn("No geocoding results found for address: {}", address);
                return ApiResponse.error("Không tìm thấy tọa độ cho địa chỉ này");
            }
            
        } catch (Exception e) {
            log.error("Geocoding error for address: {}", address, e);
            log.error("Error details: {}", e.toString());
            return ApiResponse.error("Lỗi khi tìm tọa độ: " + e.getMessage());
        }
    }
    
    @GetMapping("/reverse")
    @Operation(summary = "Tìm địa chỉ từ tọa độ", description = "Reverse geocoding từ latitude/longitude")
    public ApiResponse<Map<String, Object>> reverseGeocode(
            @Parameter(description = "Vĩ độ") @RequestParam double latitude,
            @Parameter(description = "Kinh độ") @RequestParam double longitude) {
        
        try {
            log.debug("Reverse geocoding: ({}, {})", latitude, longitude);
            
            String url = String.format("https://nominatim.openstreetmap.org/reverse?format=json&lat=%f&lon=%f&addressdetails=1", 
                    latitude, longitude);
            
            // Add User-Agent header
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "BadmintonCourtApp/1.0 (contact@badminton.com)");
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                    url, 
                    org.springframework.http.HttpMethod.GET, 
                    entity, 
                    Map.class
            );
            
            Map<String, Object> result = response.getBody();
            
            if (result != null && result.containsKey("display_name")) {
                Map<String, Object> reverseResult = new HashMap<>();
                reverseResult.put("display_name", result.get("display_name"));
                reverseResult.put("address", result.get("address"));
                
                log.info("Reverse geocoding successful: ({}, {}) -> {}", 
                        latitude, longitude, result.get("display_name"));
                
                return ApiResponse.success(reverseResult);
            } else {
                return ApiResponse.error("Không tìm thấy địa chỉ cho tọa độ này");
            }
            
        } catch (Exception e) {
            log.error("Reverse geocoding error: ({}, {})", latitude, longitude, e);
            return ApiResponse.error("Lỗi khi tìm địa chỉ: " + e.getMessage());
        }
    }
} 