package com.badminton.courtmanagement.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.SecureRandom;
import java.util.Base64;

public final class SecurityUtils {
    
    private static final SecureRandom secureRandom = new SecureRandom();
    
    private SecurityUtils() {
        // Prevent instantiation
    }
    
    /**
     * Lấy thông tin user hiện tại từ SecurityContext
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        }
        
        return null;
    }
    
    /**
     * Kiểm tra user hiện tại có authenticated không
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.isAuthenticated() && 
               !"anonymousUser".equals(authentication.getPrincipal());
    }
    
    /**
     * Kiểm tra user hiện tại có role cụ thể không
     */
    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
    
    /**
     * Kiểm tra user hiện tại có phải admin không
     */
    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }
    
    /**
     * Kiểm tra user hiện tại có phải court owner không
     */
    public static boolean isCourtOwner() {
        return hasRole("COURT_OWNER");
    }
    
    /**
     * Kiểm tra user hiện tại có phải user thường không
     */
    public static boolean isUser() {
        return hasRole("USER");
    }
    
    /**
     * Tạo random string để làm token hoặc ID
     */
    public static String generateRandomString(int length) {
        byte[] randomBytes = new byte[length];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
    
    /**
     * Tạo transaction ID unique
     */
    public static String generateTransactionId() {
        long timestamp = System.currentTimeMillis();
        String randomPart = generateRandomString(6);
        return "TXN" + timestamp + randomPart;
    }
    
    /**
     * Tạo booking reference unique
     */
    public static String generateBookingReference() {
        long timestamp = System.currentTimeMillis();
        String randomPart = generateRandomString(4);
        return "BK" + timestamp + randomPart;
    }
    
    /**
     * Mask email để hiển thị an toàn (ví dụ: test@example.com -> t***@example.com)
     */
    public static String maskEmail(String email) {
        if (email == null || email.length() < 3) {
            return email;
        }
        
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return email;
        }
        
        String localPart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex);
        
        if (localPart.length() <= 2) {
            return email;
        }
        
        String maskedLocal = localPart.charAt(0) + 
                           "*".repeat(localPart.length() - 2) + 
                           localPart.charAt(localPart.length() - 1);
        
        return maskedLocal + domainPart;
    }
    
    /**
     * Mask phone number để hiển thị an toàn (ví dụ: 0123456789 -> 012***6789)
     */
    public static String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() < 6) {
            return phone;
        }
        
        String cleanPhone = phone.replaceAll("[^0-9+]", "");
        
        if (cleanPhone.length() < 6) {
            return phone;
        }
        
        int maskStart = 3;
        int maskEnd = cleanPhone.length() - 4;
        
        if (maskEnd <= maskStart) {
            return phone;
        }
        
        return cleanPhone.substring(0, maskStart) + 
               "*".repeat(maskEnd - maskStart) + 
               cleanPhone.substring(maskEnd);
    }
    
    /**
     * Kiểm tra IP address có hợp lệ không
     */
    public static boolean isValidIpAddress(String ip) {
        if (ip == null || ip.isEmpty()) {
            return false;
        }
        
        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            return false;
        }
        
        try {
            for (String part : parts) {
                int num = Integer.parseInt(part);
                if (num < 0 || num > 255) {
                    return false;
                }
            }
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    /**
     * Sanitize string để tránh XSS
     */
    public static String sanitizeString(String input) {
        if (input == null) {
            return null;
        }
        
        return input.replaceAll("<", "&lt;")
                   .replaceAll(">", "&gt;")
                   .replaceAll("\"", "&quot;")
                   .replaceAll("'", "&#x27;")
                   .replaceAll("/", "&#x2F;");
    }
} 