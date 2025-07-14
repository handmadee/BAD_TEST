-- =====================================================
-- BADMINTON COURT MANAGEMENT SYSTEM - OPTIMIZED FOR VIETQR ONLY
-- =====================================================

-- Tạo database
DROP DATABASE IF EXISTS badminton_management;
CREATE DATABASE badminton_management 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE badminton_management;

-- =====================================================
-- 1. BẢNG USERS - QUẢN LÝ NGƯỜI DÙNG
-- =====================================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    avatar_url VARCHAR(500),
    bio TEXT,
    location VARCHAR(255),
    skill_level ENUM('WEAK', 'AVERAGE', 'GOOD', 'EXCELLENT') DEFAULT 'WEAK',
    preferred_sports SET('BADMINTON', 'PICKLEBALL') DEFAULT 'BADMINTON',
    
    -- Authentication
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Account status
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    role ENUM('USER', 'COURT_OWNER', 'ADMIN') DEFAULT 'USER',
    
    -- Social
    facebook_url VARCHAR(255),
    
    -- Tracking
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_role_status (role, status)
);

-- =====================================================
-- 2. BẢNG COURT_OWNERS - CHỦ SÂN VÀ THÔNG TIN NGÂN HÀNG
-- =====================================================
CREATE TABLE court_owners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    business_name VARCHAR(255),
    business_phone VARCHAR(20),
    business_email VARCHAR(255),
    description TEXT,
    
    -- Banking info for VietQR/Casso (REQUIRED for payment)
    bank_name VARCHAR(50) NOT NULL, -- Vietcombank, Techcombank, etc.
    bank_account VARCHAR(50) NOT NULL, -- Số tài khoản để nhận tiền
    bank_bin VARCHAR(6) NOT NULL, -- Mã BIN ngân hàng cho VietQR
    account_holder_name VARCHAR(255) NOT NULL, -- Tên chủ tài khoản
    
    -- Verification
    verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
    verified_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_bank_account (bank_account), -- Mỗi tài khoản chỉ thuộc 1 owner
    INDEX idx_bank_account (bank_account),
    INDEX idx_verification_status (verification_status)
);

-- =====================================================
-- 3. BẢNG COURTS - THÔNG TIN SÂN
-- =====================================================
CREATE TABLE courts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    sport_types SET('BADMINTON', 'PICKLEBALL') NOT NULL DEFAULT 'BADMINTON',
    total_courts INT NOT NULL DEFAULT 1,
    opening_time TIME DEFAULT '06:00:00',
    closing_time TIME DEFAULT '22:00:00',
    phone VARCHAR(20),
    email VARCHAR(255),
    facebook_url VARCHAR(255),
    amenities JSON,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    images JSON,
    cover_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_owner_id (owner_id),
    INDEX idx_status (status),
    INDEX idx_sport_types (sport_types),
    INDEX idx_location (latitude, longitude),
    INDEX idx_city_district (city, district),
    
    FOREIGN KEY (owner_id) REFERENCES court_owners(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. BẢNG COURT_PRICING - GIÁ THEO KHUNG GIỜ
-- =====================================================
CREATE TABLE court_pricing (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    court_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'Bảng giá chính thức',
    
    -- Time and day type (simplified)
    day_type ENUM('WEEKDAY', 'WEEKEND') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    INDEX idx_court_pricing (court_id, day_type, start_time, end_time)
);

-- =====================================================
-- 5. BẢNG BOOKINGS - ĐẶT SÂN (VietQR Only)
-- =====================================================
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    court_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    vietqr_url TEXT,
    booking_reference VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_court_id (court_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status),
    INDEX idx_booking_reference (booking_reference),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);

-- =====================================================
-- 6. BẢNG TRANSACTIONS - WEBHOOK DATA TỪ CASSO
-- =====================================================
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT,
    
    -- Transaction details
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    bank_account VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100),
    transaction_date DATETIME NOT NULL,
    
    -- Transaction type and status (enums)
    type ENUM('CREDIT', 'DEBIT') DEFAULT 'CREDIT',
    status ENUM('PENDING', 'PROCESSED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    
    -- Additional fields
    casso_id VARCHAR(50),
    webhook_data TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_bank_account (bank_account),
    INDEX idx_booking_id (booking_id)
);

-- =====================================================
-- 7. BẢNG TEAM_POSTS - BÀI ĐĂNG TÌM ĐỘI
-- =====================================================
CREATE TABLE team_posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    
    -- Post content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sport_type ENUM('BADMINTON', 'PICKLEBALL') NOT NULL,
    skill_level VARCHAR(20),
    
    -- Game details
    play_date DATETIME NOT NULL,
    location VARCHAR(500),
    
    -- Player requirements
    max_players TINYINT NOT NULL,
    current_players TINYINT DEFAULT 1,
    
    -- Status and images
    status ENUM('ACTIVE', 'FULL', 'CANCELLED', 'COMPLETED') DEFAULT 'ACTIVE',
    images TEXT, -- JSON string of image URLs
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_sport_date (sport_type, play_date),
    INDEX idx_status_date (status, play_date)
);

-- =====================================================
-- 8. BẢNG TEAM_MEMBERS - THÀNH VIÊN ĐỘI
-- =====================================================
CREATE TABLE team_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    -- Member status - match with entity enum
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    
    -- BaseEntity fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (team_post_id) REFERENCES team_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_post_user (team_post_id, user_id),
    INDEX idx_post_status (team_post_id, status),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- 9. BẢNG REVIEWS - ĐÁNH GIÁ SÂN
-- =====================================================
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    court_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    booking_id BIGINT,
    
    -- Rating (1-5 stars) - chỉ overall rating
    overall_rating TINYINT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    
    -- Review content
    title VARCHAR(255),
    comment TEXT NOT NULL,
    
    -- Review metadata
    visit_date DATE,
    sport_played ENUM('BADMINTON', 'PICKLEBALL'),
    would_recommend BOOLEAN,
    
    -- Images
    images JSON,
    
    -- Status
    status ENUM('PUBLISHED', 'PENDING', 'REJECTED') DEFAULT 'PUBLISHED',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- One review per user per court
    UNIQUE KEY uk_user_court (user_id, court_id),
    
    INDEX idx_court_rating (court_id, overall_rating DESC),
    INDEX idx_status (status)
);

-- =====================================================
-- 10. BẢNG MESSAGES - TIN NHẮN
-- =====================================================
CREATE TABLE messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    
    -- Message content
    message_type ENUM('TEXT', 'IMAGE') DEFAULT 'TEXT',
    content TEXT NOT NULL,
    
    -- Related entities
    related_court_id BIGINT,
    related_booking_id BIGINT,
    related_post_id BIGINT,
    
    -- Message status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_court_id) REFERENCES courts(id) ON DELETE SET NULL,
    FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (related_post_id) REFERENCES team_posts(id) ON DELETE SET NULL,
    
    INDEX idx_receiver_unread (receiver_id, is_read),
    INDEX idx_conversation (sender_id, receiver_id, created_at DESC)
);

-- =====================================================
-- 11. BẢNG NOTIFICATIONS - THÔNG BÁO
-- =====================================================
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    
    -- Notification content
    type ENUM('BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 
              'TEAM_REQUEST', 'TEAM_APPROVED', 'NEW_MESSAGE', 'REVIEW_RECEIVED') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    
    -- Related entities
    related_court_id BIGINT,
    related_booking_id BIGINT,
    related_post_id BIGINT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_court_id) REFERENCES courts(id) ON DELETE CASCADE,
    FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (related_post_id) REFERENCES team_posts(id) ON DELETE CASCADE,
    
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_type_created (type, created_at DESC)
);

-- =====================================================
-- 12. BẢNG USER_FAVORITES - SÂN YÊU THÍCH
-- =====================================================
CREATE TABLE user_favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    court_id BIGINT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_user_court (user_id, court_id),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- 13. BẢNG DISCOUNTS - MÃ GIẢM GIÁ (Đơn giản)
-- =====================================================
CREATE TABLE discounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Discount details
    type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    
    -- Usage limits
    usage_limit INT,
    current_usage INT DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    
    -- Conditions
    min_booking_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code_active (code, is_active),
    INDEX idx_validity (valid_from, valid_until)
);

-- =====================================================
-- 14. BẢNG DISCOUNT_USAGES - LỊCH SỬ SỬ DỤNG GIẢM GIÁ
-- =====================================================
CREATE TABLE discount_usages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    discount_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    INDEX idx_discount_id (discount_id),
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- TRIGGERS CƠ BẢN
-- =====================================================

-- Update court rating khi có review mới
DELIMITER //
CREATE TRIGGER update_court_rating_after_review 
AFTER INSERT ON reviews 
FOR EACH ROW
BEGIN
    UPDATE courts 
    SET 
        average_rating = (
            SELECT AVG(overall_rating) 
            FROM reviews 
            WHERE court_id = NEW.court_id AND status = 'PUBLISHED'
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE court_id = NEW.court_id AND status = 'PUBLISHED'
        )
    WHERE id = NEW.court_id;
END//

-- Update team post current players
CREATE TRIGGER update_team_players_insert 
AFTER INSERT ON team_members 
FOR EACH ROW
BEGIN
    UPDATE team_posts 
    SET current_players = (
        SELECT COUNT(*) 
        FROM team_members 
        WHERE team_post_id = NEW.team_post_id AND status = 'ACCEPTED'
    )
    WHERE id = NEW.team_post_id;
END//

CREATE TRIGGER update_team_players_update 
AFTER UPDATE ON team_members 
FOR EACH ROW
BEGIN
    UPDATE team_posts 
    SET current_players = (
        SELECT COUNT(*) 
        FROM team_members 
        WHERE team_post_id = NEW.team_post_id AND status = 'ACCEPTED'
    )
    WHERE id = NEW.team_post_id;
END//

CREATE TRIGGER update_team_players_delete 
AFTER DELETE ON team_members 
FOR EACH ROW
BEGIN
    UPDATE team_posts 
    SET current_players = (
        SELECT COUNT(*) 
        FROM team_members 
        WHERE team_post_id = OLD.team_post_id AND status = 'ACCEPTED'
    )
    WHERE id = OLD.team_post_id;
END//

DELIMITER ;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Tìm sân trống
DELIMITER //
CREATE PROCEDURE GetAvailableCourts(
    IN p_city VARCHAR(100),
    IN p_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME
)
BEGIN
    SELECT c.* 
    FROM courts c
    WHERE c.status = 'ACTIVE'
        AND (p_city IS NULL OR c.city = p_city)
        AND c.id NOT IN (
            SELECT DISTINCT b.court_id 
            FROM bookings b 
            WHERE b.booking_date = p_date 
                AND b.status IN ('CONFIRMED', 'PENDING')
                AND NOT (b.end_time <= p_start_time OR b.start_time >= p_end_time)
        )
    ORDER BY c.featured DESC, c.average_rating DESC;
END//

-- Simple procedure example (can be customized later)
CREATE PROCEDURE GetBookingsByUser(
    IN p_user_id BIGINT
)
BEGIN
    SELECT b.*, c.name as court_name
    FROM bookings b
    INNER JOIN courts c ON b.court_id = c.id
    WHERE b.user_id = p_user_id
    ORDER BY b.booking_date DESC, b.start_time DESC;
END//

DELIMITER ;

-- =====================================================
-- INDEXES QUAN TRỌNG CHO PERFORMANCE
-- =====================================================

-- Indexes cho tìm kiếm thường dùng
CREATE INDEX idx_courts_search ON courts (city, sport_types, status);
CREATE INDEX idx_bookings_user_date ON bookings (user_id, booking_date DESC);
CREATE INDEX idx_team_posts_active ON team_posts (status, play_date);
CREATE INDEX idx_reviews_court_published ON reviews (court_id, status);

-- =====================================================
-- VIEWS HỮU ÍCH
-- =====================================================

-- Court summary view
CREATE VIEW court_summary AS
SELECT 
    c.id,
    c.name,
    c.address,
    c.city,
    c.sport_types,
    c.average_rating,
    c.total_reviews,
    c.status,
    c.featured,
    co.business_name as owner_name,
    co.bank_name,
    co.bank_account
FROM courts c
LEFT JOIN court_owners co ON c.owner_id = co.id
WHERE c.status = 'ACTIVE';

-- User activity view
CREATE VIEW user_activity AS
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.email,
    u.skill_level,
    COUNT(b.id) as total_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_spent,
    COUNT(tp.id) as total_team_posts
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id AND b.status = 'CONFIRMED'
LEFT JOIN team_posts tp ON u.id = tp.user_id
GROUP BY u.id;

-- Booking revenue by court owner (via bookings)
CREATE VIEW owner_revenue AS
SELECT 
    co.id as owner_id,
    co.business_name,
    co.bank_account,
    COUNT(b.id) as total_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_revenue,
    DATE(b.booking_date) as booking_date
FROM court_owners co
LEFT JOIN courts c ON co.id = c.owner_id
LEFT JOIN bookings b ON c.id = b.court_id AND b.status = 'CONFIRMED'
GROUP BY co.id, DATE(b.booking_date);

-- =====================================================
-- KẾT THÚC SCHEMA OPTIMIZED
-- ===================================================== 