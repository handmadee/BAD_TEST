package com.badminton.courtmanagement.constants;

public final class ErrorConstants {
    
    // User errors
    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
    public static final String USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
    public static final String USER_INACTIVE = "USER_INACTIVE";
    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
    public static final String EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS";
    public static final String PHONE_ALREADY_EXISTS = "PHONE_ALREADY_EXISTS";
    public static final String PASSWORD_MISMATCH = "PASSWORD_MISMATCH";
    public static final String INVALID_CURRENT_PASSWORD = "INVALID_CURRENT_PASSWORD";
    
    // Court errors
    public static final String COURT_NOT_FOUND = "COURT_NOT_FOUND";
    public static final String COURT_INACTIVE = "COURT_INACTIVE";
    public static final String COURT_OWNER_NOT_FOUND = "COURT_OWNER_NOT_FOUND";
    
    // Booking errors
    public static final String BOOKING_NOT_FOUND = "BOOKING_NOT_FOUND";
    public static final String BOOKING_CONFLICT = "BOOKING_CONFLICT";
    public static final String BOOKING_PAST_DATE = "BOOKING_PAST_DATE";
    public static final String BOOKING_INVALID_TIME = "BOOKING_INVALID_TIME";
    public static final String BOOKING_ALREADY_PAID = "BOOKING_ALREADY_PAID";
    public static final String BOOKING_CANNOT_CANCEL = "BOOKING_CANNOT_CANCEL";
    
    // Payment errors
    public static final String PAYMENT_FAILED = "PAYMENT_FAILED";
    public static final String PAYMENT_ALREADY_PROCESSED = "PAYMENT_ALREADY_PROCESSED";
    public static final String INVALID_PAYMENT_AMOUNT = "INVALID_PAYMENT_AMOUNT";
    
    // Discount errors
    public static final String DISCOUNT_NOT_FOUND = "DISCOUNT_NOT_FOUND";
    public static final String DISCOUNT_EXPIRED = "DISCOUNT_EXPIRED";
    public static final String DISCOUNT_ALREADY_USED = "DISCOUNT_ALREADY_USED";
    public static final String DISCOUNT_USAGE_LIMIT_EXCEEDED = "DISCOUNT_USAGE_LIMIT_EXCEEDED";
    public static final String DISCOUNT_MIN_AMOUNT_NOT_MET = "DISCOUNT_MIN_AMOUNT_NOT_MET";
    
    // Team errors
    public static final String TEAM_POST_NOT_FOUND = "TEAM_POST_NOT_FOUND";
    public static final String TEAM_POST_FULL = "TEAM_POST_FULL";
    public static final String TEAM_POST_CLOSED = "TEAM_POST_CLOSED";
    public static final String ALREADY_JOINED_TEAM = "ALREADY_JOINED_TEAM";
    public static final String TEAM_MEMBER_NOT_FOUND = "TEAM_MEMBER_NOT_FOUND";
    public static final String USER_NOT_IN_TEAM = "USER_NOT_IN_TEAM";
    public static final String USER_ALREADY_IN_TEAM = "USER_ALREADY_IN_TEAM";
    public static final String CREATOR_CANNOT_LEAVE = "CREATOR_CANNOT_LEAVE";
    public static final String CREATOR_CANNOT_JOIN = "CREATOR_CANNOT_JOIN";
    public static final String TEAM_FULL = "TEAM_FULL";
    public static final String PLAY_DATE_PAST = "PLAY_DATE_PAST";
    public static final String MIN_PLAYERS_REQUIRED = "MIN_PLAYERS_REQUIRED";
    
    // Review errors
    public static final String REVIEW_NOT_FOUND = "REVIEW_NOT_FOUND";
    public static final String REVIEW_ALREADY_EXISTS = "REVIEW_ALREADY_EXISTS";
    public static final String CANNOT_REVIEW_OWN_COURT = "CANNOT_REVIEW_OWN_COURT";
    public static final String NO_COMPLETED_BOOKING = "NO_COMPLETED_BOOKING";
    
    // Message errors
    public static final String MESSAGE_NOT_FOUND = "MESSAGE_NOT_FOUND";
    public static final String CANNOT_MESSAGE_YOURSELF = "CANNOT_MESSAGE_YOURSELF";
    
    // Notification errors
    public static final String NOTIFICATION_NOT_FOUND = "NOTIFICATION_NOT_FOUND";
    
    // Authorization errors
    public static final String ACCESS_DENIED = "ACCESS_DENIED";
    public static final String INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS";
    public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
    public static final String INVALID_TOKEN = "INVALID_TOKEN";
    
    // Validation errors
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
    public static final String CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION";
    public static final String INVALID_INPUT = "INVALID_INPUT";
    public static final String REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING";
    
    // System errors
    public static final String INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
    public static final String SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
    public static final String DATABASE_ERROR = "DATABASE_ERROR";
    public static final String EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR";
    
    private ErrorConstants() {
        // Prevent instantiation
    }
} 