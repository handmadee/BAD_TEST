package com.badminton.courtmanagement.exception;

import com.badminton.courtmanagement.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Resource not found - RequestId: {}, Message: {}", requestId, ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode());
        response.setRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(
            ValidationException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Validation error - RequestId: {}, Message: {}", requestId, ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode());
        response.setRequestId(requestId);
        if (ex.getFieldErrors() != null) {
            response.setData(ex.getFieldErrors());
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Object>> handleUnauthorizedException(
            UnauthorizedException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Unauthorized access - RequestId: {}, Message: {}", requestId, ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode());
        response.setRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Object>> handleConflictException(
            ConflictException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Conflict error - RequestId: {}, Message: {}", requestId, ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode());
        response.setRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(
            BusinessException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Business error - RequestId: {}, Message: {}", requestId, ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error(ex.getMessage(), ex.getErrorCode());
        response.setRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Validation error - RequestId: {}", requestId);
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ApiResponse<Object> response = ApiResponse.error("Dữ liệu đầu vào không hợp lệ", "VALIDATION_ERROR");
        response.setRequestId(requestId);
        response.setData(errors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(
            ConstraintViolationException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Constraint violation - RequestId: {}", requestId);
        
        Map<String, String> errors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }
        
        ApiResponse<Object> response = ApiResponse.error("Dữ liệu vi phạm ràng buộc", "CONSTRAINT_VIOLATION");
        response.setRequestId(requestId);
        response.setData(errors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleEntityNotFoundException(
            EntityNotFoundException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Entity not found - RequestId: {}, Message: {}", requestId, ex.getMessage());
        
        ApiResponse<Object> response = ApiResponse.error("Không tìm thấy dữ liệu", "ENTITY_NOT_FOUND");
        response.setRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(
            BadCredentialsException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Bad credentials - RequestId: {}", requestId);
        
        ApiResponse<Object> response = ApiResponse.error("Email hoặc mật khẩu không chính xác", "BAD_CREDENTIALS");
        response.setRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(
            AccessDeniedException ex, WebRequest request) {
        String requestId = generateRequestId();
        log.warn("Access denied - RequestId: {}", requestId);
        
        ApiResponse<Object> response = ApiResponse.error("Bạn không có quyền truy cập", "ACCESS_DENIED");
        response.setRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGlobalException(
            Exception ex, WebRequest request) {
        String requestId = generateRequestId();
        log.error("Unexpected error - RequestId: {}, Message: {}", requestId, ex.getMessage(), ex);
        
        ApiResponse<Object> response = ApiResponse.error("Đã xảy ra lỗi không mong muốn", "INTERNAL_SERVER_ERROR");
        response.setRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    
    private String generateRequestId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
} 