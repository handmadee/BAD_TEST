package com.badminton.courtmanagement.utils;

import com.badminton.courtmanagement.constants.AppConstants;

import java.math.BigDecimal;
import java.util.regex.Pattern;

public final class ValidationUtils {
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(AppConstants.PHONE_PATTERN);
    private static final Pattern EMAIL_PATTERN = Pattern.compile(AppConstants.EMAIL_PATTERN);
    
    private ValidationUtils() {
        // Prevent instantiation
    }
    
    /**
     * Kiểm tra email có hợp lệ không
     */
    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Kiểm tra số điện thoại có hợp lệ không
     */
    public static boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }
    
    /**
     * Kiểm tra mật khẩu có đủ mạnh không
     */
    public static boolean isValidPassword(String password) {
        if (password == null) {
            return false;
        }
        
        int length = password.length();
        return length >= AppConstants.PASSWORD_MIN_LENGTH && 
               length <= AppConstants.PASSWORD_MAX_LENGTH;
    }
    
    /**
     * Kiểm tra đánh giá có hợp lệ không (1-5 sao)
     */
    public static boolean isValidRating(Integer rating) {
        return rating != null && 
               rating >= AppConstants.MIN_RATING && 
               rating <= AppConstants.MAX_RATING;
    }
    
    /**
     * Kiểm tra số lượng người chơi có hợp lệ không
     */
    public static boolean isValidPlayerCount(Integer playerCount) {
        return playerCount != null && 
               playerCount >= AppConstants.MIN_TEAM_PLAYERS && 
               playerCount <= AppConstants.MAX_TEAM_PLAYERS;
    }
    
    /**
     * Kiểm tra số tiền có hợp lệ không (> 0)
     */
    public static boolean isValidAmount(BigDecimal amount) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }
    
    /**
     * Kiểm tra tọa độ latitude có hợp lệ không (-90 đến 90)
     */
    public static boolean isValidLatitude(BigDecimal latitude) {
        if (latitude == null) {
            return false;
        }
        return latitude.compareTo(new BigDecimal("-90")) >= 0 && 
               latitude.compareTo(new BigDecimal("90")) <= 0;
    }
    
    /**
     * Kiểm tra tọa độ longitude có hợp lệ không (-180 đến 180)
     */
    public static boolean isValidLongitude(BigDecimal longitude) {
        if (longitude == null) {
            return false;
        }
        return longitude.compareTo(new BigDecimal("-180")) >= 0 && 
               longitude.compareTo(new BigDecimal("180")) <= 0;
    }
    
    /**
     * Kiểm tra chuỗi có null hoặc empty không
     */
    public static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
    
    /**
     * Kiểm tra chuỗi có hợp lệ không (không null và không empty)
     */
    public static boolean isValidString(String str) {
        return !isNullOrEmpty(str);
    }
    
    /**
     * Kiểm tra chuỗi có độ dài hợp lệ không
     */
    public static boolean isValidLength(String str, int minLength, int maxLength) {
        if (str == null) {
            return false;
        }
        int length = str.trim().length();
        return length >= minLength && length <= maxLength;
    }
    
    /**
     * Kiểm tra giá trị có trong khoảng hợp lệ không
     */
    public static boolean isInRange(Integer value, int min, int max) {
        return value != null && value >= min && value <= max;
    }
    
    /**
     * Kiểm tra giá trị có trong khoảng hợp lệ không
     */
    public static boolean isInRange(BigDecimal value, BigDecimal min, BigDecimal max) {
        return value != null && 
               value.compareTo(min) >= 0 && 
               value.compareTo(max) <= 0;
    }
    
    /**
     * Chuẩn hóa số điện thoại (chuyển 0 thành +84)
     */
    public static String normalizePhoneNumber(String phone) {
        if (phone == null) {
            return null;
        }
        
        phone = phone.trim().replaceAll("\\s+", "");
        
        if (phone.startsWith("0")) {
            return "+84" + phone.substring(1);
        }
        
        if (!phone.startsWith("+84")) {
            return "+84" + phone;
        }
        
        return phone;
    }
    
    /**
     * Chuẩn hóa email (chuyển về lowercase)
     */
    public static String normalizeEmail(String email) {
        return email != null ? email.trim().toLowerCase() : null;
    }
    
    /**
     * Kiểm tra URL có hợp lệ không
     */
    public static boolean isValidUrl(String url) {
        if (isNullOrEmpty(url)) {
            return false;
        }
        
        try {
            new java.net.URL(url);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Kiểm tra file extension có được phép không
     */
    public static boolean isAllowedImageType(String filename) {
        if (isNullOrEmpty(filename)) {
            return false;
        }
        
        String extension = getFileExtension(filename).toLowerCase();
        for (String allowedType : AppConstants.ALLOWED_IMAGE_TYPES) {
            if (allowedType.equals(extension)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Lấy file extension từ filename
     */
    public static String getFileExtension(String filename) {
        if (isNullOrEmpty(filename)) {
            return "";
        }
        
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        
        return filename.substring(lastDotIndex + 1);
    }
} 