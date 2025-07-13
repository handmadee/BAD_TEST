package com.badminton.courtmanagement.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public final class DateUtils {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    private DateUtils() {
        // Prevent instantiation
    }
    
    /**
     * Kiểm tra xem ngày có phải là quá khứ không
     */
    public static boolean isPastDate(LocalDate date) {
        return date.isBefore(LocalDate.now());
    }
    
    /**
     * Kiểm tra xem datetime có phải là quá khứ không
     */
    public static boolean isPastDateTime(LocalDateTime dateTime) {
        return dateTime.isBefore(LocalDateTime.now());
    }
    
    /**
     * Kiểm tra xem ngày có phải là hôm nay không
     */
    public static boolean isToday(LocalDate date) {
        return date.equals(LocalDate.now());
    }
    
    /**
     * Kiểm tra xem ngày có phải là tương lai không
     */
    public static boolean isFutureDate(LocalDate date) {
        return date.isAfter(LocalDate.now());
    }
    
    /**
     * Tính số ngày giữa hai ngày
     */
    public static long daysBetween(LocalDate startDate, LocalDate endDate) {
        return ChronoUnit.DAYS.between(startDate, endDate);
    }
    
    /**
     * Tính số giờ giữa hai datetime
     */
    public static long hoursBetween(LocalDateTime startDateTime, LocalDateTime endDateTime) {
        return ChronoUnit.HOURS.between(startDateTime, endDateTime);
    }
    
    /**
     * Tính số phút giữa hai time
     */
    public static long minutesBetween(LocalTime startTime, LocalTime endTime) {
        return ChronoUnit.MINUTES.between(startTime, endTime);
    }
    
    /**
     * Kiểm tra xem có thể đặt lịch trước bao nhiều giờ
     */
    public static boolean canBookInAdvance(LocalDateTime bookingDateTime, int minHoursAdvance) {
        LocalDateTime minBookingTime = LocalDateTime.now().plusHours(minHoursAdvance);
        return bookingDateTime.isAfter(minBookingTime);
    }
    
    /**
     * Kiểm tra xem có thể đặt lịch trước bao nhiều ngày
     */
    public static boolean canBookInAdvance(LocalDate bookingDate, int maxDaysAdvance) {
        LocalDate maxBookingDate = LocalDate.now().plusDays(maxDaysAdvance);
        return !bookingDate.isAfter(maxBookingDate);
    }
    
    /**
     * Kiểm tra xem thời gian có hợp lệ cho hoạt động của sân không
     */
    public static boolean isValidOperatingTime(LocalTime time, int startHour, int endHour) {
        return time.getHour() >= startHour && time.getHour() < endHour;
    }
    
    /**
     * Kiểm tra xem khoảng thời gian có hợp lệ không (startTime < endTime)
     */
    public static boolean isValidTimeRange(LocalTime startTime, LocalTime endTime) {
        return startTime.isBefore(endTime);
    }
    
    /**
     * Kiểm tra xem hai khoảng thời gian có bị trùng lặp không
     */
    public static boolean isTimeOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
    
    /**
     * Kiểm tra xem hai khoảng datetime có bị trùng lặp không
     */
    public static boolean isDateTimeOverlap(LocalDateTime start1, LocalDateTime end1, 
                                          LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
    
    /**
     * Format date thành string
     */
    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }
    
    /**
     * Format datetime thành string
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : null;
    }
    
    /**
     * Format time thành string
     */
    public static String formatTime(LocalTime time) {
        return time != null ? time.format(TIME_FORMATTER) : null;
    }
    
    /**
     * Parse string thành LocalDate
     */
    public static LocalDate parseDate(String dateString) {
        try {
            return LocalDate.parse(dateString, DATE_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Parse string thành LocalDateTime
     */
    public static LocalDateTime parseDateTime(String dateTimeString) {
        try {
            return LocalDateTime.parse(dateTimeString, DATETIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Parse string thành LocalTime
     */
    public static LocalTime parseTime(String timeString) {
        try {
            return LocalTime.parse(timeString, TIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Lấy đầu ngày (00:00:00)
     */
    public static LocalDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay();
    }
    
    /**
     * Lấy cuối ngày (23:59:59)
     */
    public static LocalDateTime endOfDay(LocalDate date) {
        return date.atTime(23, 59, 59);
    }
} 