package com.badminton.courtmanagement.controller;

import com.badminton.courtmanagement.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "API dashboard và thống kê")
public class DashboardController {

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê dashboard", description = "Lấy các thống kê tổng quan cho dashboard")
    public ApiResponse<Map<String, Object>> getDashboardStats() {
        // Trả về thống kê mẫu để test
        Map<String, Object> stats = Map.of(
            "totalCourts", 15,
            "totalBookings", 245,
            "totalRevenue", 12500000,
            "activeUsers", 320,
            "todayBookings", 8,
            "weeklyRevenue", 2800000,
            "monthlyBookings", 89,
            "averageRating", 4.6
        );
        
        return ApiResponse.success(stats);
    }
} 