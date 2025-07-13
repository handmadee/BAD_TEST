package com.badminton.courtmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Health", description = "API kiểm tra trạng thái hệ thống")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Kiểm tra trạng thái backend", description = "Endpoint để kiểm tra backend có hoạt động không")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "message", "Backend đang hoạt động bình thường",
                "timestamp", LocalDateTime.now(),
                "version", "1.0.0"
        ));
    }
} 