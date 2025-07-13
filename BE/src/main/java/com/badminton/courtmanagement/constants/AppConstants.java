package com.badminton.courtmanagement.constants;

public final class AppConstants {
    
    // Pagination
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "asc";
    public static final int MAX_PAGE_SIZE = 100;
    
    // Date/Time formats
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String TIME_FORMAT = "HH:mm";
    
    // File upload
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final String[] ALLOWED_IMAGE_TYPES = {"jpg", "jpeg", "png", "gif"};
    public static final String UPLOAD_DIR = "uploads/";
    public static final String COURT_IMAGES_DIR = "courts/";
    public static final String USER_IMAGES_DIR = "users/";
    public static final String POST_IMAGES_DIR = "posts/";
    
    // Business rules
    public static final int MIN_BOOKING_HOURS_ADVANCE = 2;
    public static final int MAX_BOOKING_DAYS_ADVANCE = 30;
    public static final int BOOKING_SLOT_DURATION_MINUTES = 60;
    public static final int COURT_OPERATING_START_HOUR = 6;
    public static final int COURT_OPERATING_END_HOUR = 23;
    
    // Rating
    public static final int MIN_RATING = 1;
    public static final int MAX_RATING = 5;
    
    // Team post
    public static final int MIN_TEAM_PLAYERS = 2;
    public static final int MAX_TEAM_PLAYERS = 20;
    
    // VietQR
    public static final String VIETQR_API_URL = "https://api.vietqr.io/v2/generate";
    public static final String DEFAULT_BANK_BIN = "970422"; // MB Bank
    public static final String QR_TEMPLATE = "compact2";
    
    // Cache keys
    public static final String CACHE_COURTS = "courts";
    public static final String CACHE_COURT_PRICING = "court_pricing";
    public static final String CACHE_USER_PROFILE = "user_profile";
    public static final String CACHE_TEAM_POSTS = "team_posts";
    
    // Cache TTL (in seconds)
    public static final long CACHE_TTL_SHORT = 300; // 5 minutes
    public static final long CACHE_TTL_MEDIUM = 1800; // 30 minutes
    public static final long CACHE_TTL_LONG = 3600; // 1 hour
    
    // Security
    public static final int PASSWORD_MIN_LENGTH = 6;
    public static final int PASSWORD_MAX_LENGTH = 100;
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";
    
    // Regex patterns
    public static final String PHONE_PATTERN = "^(\\+84|0)[0-9]{9,10}$";
    public static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
    
    // Messages
    public static final String SUCCESS_MESSAGE = "Thành công";
    public static final String CREATED_MESSAGE = "Tạo mới thành công";
    public static final String UPDATED_MESSAGE = "Cập nhật thành công";
    public static final String DELETED_MESSAGE = "Xóa thành công";
    
    private AppConstants() {
        // Prevent instantiation
    }
} 