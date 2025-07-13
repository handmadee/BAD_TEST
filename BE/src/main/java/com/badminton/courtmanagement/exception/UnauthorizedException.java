package com.badminton.courtmanagement.exception;

public class UnauthorizedException extends BusinessException {
    
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }
    
    public UnauthorizedException() {
        super("Bạn không có quyền truy cập tài nguyên này", "UNAUTHORIZED");
    }
} 