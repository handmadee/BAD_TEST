package com.badminton.courtmanagement.exception;

public class ResourceNotFoundException extends BusinessException {
    
    public ResourceNotFoundException(String message) {
        super(message, "RESOURCE_NOT_FOUND");
    }
    
    public ResourceNotFoundException(String resourceName, Object id) {
        super(String.format("%s không tìm thấy với ID: %s", resourceName, id), "RESOURCE_NOT_FOUND");
    }
    
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s không tìm thấy với %s: %s", resourceName, fieldName, fieldValue), "RESOURCE_NOT_FOUND");
    }
} 