package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.ApiResponse;
import com.badminton.courtmanagement.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor
@Tag(name = "Courts", description = "API quản lý sân cầu lông")
public class CourtController {

    @GetMapping
    @Operation(summary = "Lấy danh sách sân", description = "Lấy danh sách tất cả sân cầu lông với phân trang")
    public ApiResponse<PageResponse<Map<String, Object>>> getAllCourts(
            @PageableDefault(size = 20) Pageable pageable) {
        // Trả về danh sách rỗng tạm thời để test
        List<Map<String, Object>> courts = new ArrayList<>();
        
        // Tạo một vài sân mẫu để test
        courts.add(Map.of(
            "id", 1L,
            "name", "Sân cầu lông ABC",
            "address", "123 Đường ABC, Quận 1, TP.HCM",
            "status", "ACTIVE"
        ));
        courts.add(Map.of(
            "id", 2L,
            "name", "Sân cầu lông XYZ", 
            "address", "456 Đường XYZ, Quận 2, TP.HCM",
            "status", "ACTIVE"
        ));
        
        PageResponse<Map<String, Object>> pageResponse = PageResponse.of(
            courts, 
            pageable.getPageNumber(), 
            pageable.getPageSize(), 
            courts.size()
        );
        
        return ApiResponse.success(pageResponse);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin sân", description = "Lấy thông tin chi tiết của một sân")
    public ApiResponse<Map<String, Object>> getCourtById(
            @Parameter(description = "ID của sân") @PathVariable Long id) {
        // Trả về object rỗng tạm thời để test
        Map<String, Object> court = Map.of(
            "id", id, 
            "name", "Test Court " + id,
            "address", "123 Test Address",
            "status", "ACTIVE"
        );
        return ApiResponse.success(court);
    }

    @GetMapping("/types")
    @Operation(summary = "Lấy danh sách loại sân", description = "Lấy danh sách tất cả loại sân có sẵn")
    public ApiResponse<List<Map<String, Object>>> getCourtTypes() {
        // Trả về danh sách loại sân mẫu để test
        List<Map<String, Object>> types = List.of(
            Map.of("id", "badminton", "name", "Sân cầu lông", "active", true),
            Map.of("id", "soccer", "name", "Sân bóng đá", "active", false),
            Map.of("id", "pickleball", "name", "Sân pickleball", "active", false),
            Map.of("id", "tennis", "name", "Sân tennis", "active", false),
            Map.of("id", "volleyball", "name", "Sân bóng chuyền", "active", false),
            Map.of("id", "basketball", "name", "Sân bóng rổ", "active", false)
        );
        
        return ApiResponse.success(types);
    }

    @GetMapping("/{id}/details")
    @Operation(summary = "Lấy chi tiết đầy đủ của sân", description = "Lấy thông tin chi tiết sân bao gồm pricing và reviews")
    public ApiResponse<Map<String, Object>> getCourtDetails(
            @Parameter(description = "ID của sân") @PathVariable Long id) {
        // Trả về chi tiết sân mẫu để test
        Map<String, Object> details = new java.util.HashMap<>();
        details.put("id", id);
        details.put("name", "Sân cầu lông " + id);
        details.put("address", "123 Test Address " + id);
        details.put("description", "Mô tả chi tiết sân " + id);
        details.put("status", "ACTIVE");
        details.put("rating", 4.5);
        details.put("reviewCount", 120);
        details.put("images", List.of("/court1.jpg", "/court2.jpg"));
        details.put("amenities", List.of("Điều hòa", "Wifi", "Thay đồ", "Nước uống"));
        details.put("courts", List.of(
            Map.of("id", 1, "name", "Sân 1", "status", "available"),
            Map.of("id", 2, "name", "Sân 2", "status", "booked"),
            Map.of("id", 3, "name", "Sân 3", "status", "available")
        ));
        details.put("reviews", List.of(
            Map.of("id", 1, "user", "Nguyễn Văn A", "rating", 5, "comment", "Sân tốt"),
            Map.of("id", 2, "user", "Trần Thị B", "rating", 4, "comment", "Giá hợp lý")
        ));
        
        return ApiResponse.success(details);
    }

    @GetMapping("/{id}/pricing")
    @Operation(summary = "Lấy bảng giá của sân", description = "Lấy thông tin giá theo khung giờ")
    public ApiResponse<Map<String, Object>> getCourtPricing(
            @Parameter(description = "ID của sân") @PathVariable Long id) {
        // Trả về bảng giá mẫu để test
        Map<String, Object> pricing = new java.util.HashMap<>();
        pricing.put("id", "pricing-" + id);
        pricing.put("courtId", id);
        pricing.put("name", "Bảng giá chính thức");
        pricing.put("isActive", true);
        
        List<Map<String, Object>> dayPricings = List.of(
            Map.of(
                "days", List.of("monday", "tuesday", "wednesday", "thursday", "friday"),
                "displayName", "Thứ 2 - Thứ 6",
                "timeSlots", List.of(
                    Map.of("startTime", "07:00", "endTime", "17:00", "price", 80000),
                    Map.of("startTime", "17:00", "endTime", "22:00", "price", 100000)
                )
            ),
            Map.of(
                "days", List.of("saturday", "sunday"),
                "displayName", "Thứ 7 - Chủ nhật",
                "timeSlots", List.of(
                    Map.of("startTime", "07:00", "endTime", "16:00", "price", 110000),
                    Map.of("startTime", "16:00", "endTime", "23:00", "price", 140000)
                )
            )
        );
        pricing.put("dayPricings", dayPricings);
        
        return ApiResponse.success(pricing);
    }
} 