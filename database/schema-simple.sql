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
    skill_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL') DEFAULT 'BEGINNER',
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
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Location
    address TEXT NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    
    -- Court details
    sport_types SET('BADMINTON', 'PICKLEBALL', 'TENNIS') NOT NULL,
    total_courts TINYINT NOT NULL DEFAULT 1,
    
    -- Operating hours
    opening_time TIME DEFAULT '06:00:00',
    closing_time TIME DEFAULT '22:00:00',
    
    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    facebook_url VARCHAR(255),
    
    -- Amenities (JSON cho flexibility)
    amenities JSON,
    
    -- Ratings
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    
    -- Status
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    featured BOOLEAN DEFAULT FALSE,
    
    -- Images
    images JSON,
    cover_image VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES court_owners(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_city_sport (city, sport_types),
    INDEX idx_status_featured (status, featured)
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
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    court_id BIGINT NOT NULL,
    
    -- Booking details
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    sport_type ENUM('BADMINTON', 'PICKLEBALL', 'TENNIS') NOT NULL,
    court_number TINYINT,
    
    -- Pricing
    total_hours DECIMAL(3,1) NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    
    -- Description for VietQR/Casso matching (REQUIRED)
    description VARCHAR(255) NOT NULL, -- Format: "Thanh toan san {court.name} - {hours}h"
    
    -- Payment (VietQR ONLY)
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    payment_method ENUM('VIETQR') DEFAULT 'VIETQR', -- Chỉ VietQR
    transaction_id VARCHAR(50), -- Mã giao dịch từ Casso
    qr_url VARCHAR(255), -- URL mã QR VietQR
    
    -- Status
    status ENUM('CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    
    -- Additional info
    notes TEXT,
    confirmation_code VARCHAR(20) UNIQUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    
    -- Constraint để đảm bảo thời gian hợp lệ
    CHECK (start_time < end_time),
    CHECK (total_amount > 0),
    CHECK (final_amount > 0),
    
    -- Index cho performance
    INDEX idx_court_time (court_id, booking_date, start_time, end_time),
    INDEX idx_user_bookings (user_id, booking_date DESC),
    INDEX idx_description (description),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_payment_status (payment_status)
);

-- =====================================================
-- 6. BẢNG TRANSACTIONS - WEBHOOK DATA TỪ CASSO
-- =====================================================
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT, -- Có thể NULL nếu không khớp với booking nào
    owner_id BIGINT NOT NULL, -- Chủ sân nhận tiền
    
    -- Transaction details from Casso webhook
    amount INT NOT NULL CHECK (amount > 0),
    description VARCHAR(255) NOT NULL, -- Format: "Thanh toan san {court.name} - {hours}h"
    transaction_id VARCHAR(50) UNIQUE NOT NULL, -- Mã giao dịch Casso
    bank_name VARCHAR(50), -- Tên ngân hàng
    account_number VARCHAR(50), -- Số tài khoản thụ hưởng
    transaction_date DATETIME, -- Thời gian giao dịch
    
    -- Status
    status VARCHAR(20) DEFAULT 'success', -- "success" hoặc "failure"
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES court_owners(id) ON DELETE CASCADE,
    
    INDEX idx_owner_date (owner_id, transaction_date),
    INDEX idx_account_number (account_number),
    INDEX idx_description_amount (description, amount),
    INDEX idx_booking_id (booking_id)
);

-- =====================================================
-- 7. BẢNG TEAM_POSTS - BÀI ĐĂNG TÌM ĐỘI
-- =====================================================
CREATE TABLE team_posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    author_id BIGINT NOT NULL,
    court_id BIGINT,
    
    -- Post content
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sport_type ENUM('BADMINTON', 'PICKLEBALL', 'TENNIS') NOT NULL,
    skill_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MIXED'),
    
    -- Game details
    play_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    custom_location VARCHAR(255), -- Khi không chọn sân có sẵn
    
    -- Player requirements
    needed_players TINYINT NOT NULL,
    current_players TINYINT DEFAULT 1,
    max_players TINYINT,
    
    -- Cost
    cost_per_person DECIMAL(10,2),
    
    -- Status
    status ENUM('ACTIVE', 'FULL', 'CANCELLED', 'COMPLETED') DEFAULT 'ACTIVE',
    
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE SET NULL,
    
    INDEX idx_author_id (author_id),
    INDEX idx_sport_date (sport_type, play_date),
    INDEX idx_status_date (status, play_date)
);

-- =====================================================
-- 8. BẢNG TEAM_MEMBERS - THÀNH VIÊN ĐỘI
-- =====================================================
CREATE TABLE team_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    
    -- Member status
    status ENUM('REQUESTED', 'APPROVED', 'REJECTED', 'LEFT') DEFAULT 'REQUESTED',
    role ENUM('ORGANIZER', 'MEMBER') DEFAULT 'MEMBER',
    
    -- Join details
    join_message TEXT,
    approved_at TIMESTAMP NULL,
    
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    
    FOREIGN KEY (post_id) REFERENCES team_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY uk_post_user (post_id, user_id),
    INDEX idx_post_status (post_id, status),
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
    sport_played ENUM('BADMINTON', 'PICKLEBALL', 'TENNIS'),
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
CREATE TRIGGER update_team_players 
AFTER INSERT ON team_members 
FOR EACH ROW
BEGIN
    IF NEW.status = 'APPROVED' THEN
        UPDATE team_posts 
        SET current_players = (
            SELECT COUNT(*) 
            FROM team_members 
            WHERE post_id = NEW.post_id AND status = 'APPROVED'
        )
        WHERE id = NEW.post_id;
    END IF;
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

-- Procedure để xử lý webhook từ Casso
CREATE PROCEDURE ProcessCassoWebhook(
    IN p_amount INT,
    IN p_description VARCHAR(255),
    IN p_transaction_id VARCHAR(50),
    IN p_bank_name VARCHAR(50),
    IN p_account_number VARCHAR(50),
    IN p_transaction_date DATETIME
)
BEGIN
    DECLARE v_booking_id BIGINT DEFAULT NULL;
    DECLARE v_owner_id BIGINT DEFAULT NULL;
    DECLARE v_exit_code INT DEFAULT 0;
    
    -- Tìm owner_id từ account_number
    SELECT id INTO v_owner_id 
    FROM court_owners 
    WHERE bank_account = p_account_number 
    LIMIT 1;
    
    -- Nếu không tìm thấy owner
    IF v_owner_id IS NULL THEN
        SET v_exit_code = 1; -- Owner không tồn tại
        -- Skip insert để tránh foreign key error
        SELECT v_exit_code as status_code, NULL as booking_id, NULL as owner_id, 'Owner not found' as message;
    ELSE
        -- Tìm booking khớp với description và amount
        SELECT b.id INTO v_booking_id
        FROM bookings b
        INNER JOIN courts c ON b.court_id = c.id
        WHERE b.description = p_description 
        AND b.final_amount = p_amount
        AND b.payment_status = 'PENDING'
        AND c.owner_id = v_owner_id
        ORDER BY b.created_at DESC
        LIMIT 1;
        
        -- Lưu transaction vào bảng transactions
        INSERT INTO transactions (
            booking_id, owner_id, amount, description, transaction_id,
            bank_name, account_number, transaction_date, status
        ) VALUES (
            v_booking_id, v_owner_id, p_amount, p_description, p_transaction_id,
            p_bank_name, p_account_number, p_transaction_date, 'success'
        );
        
        -- Nếu tìm thấy booking khớp, cập nhật trạng thái
        IF v_booking_id IS NOT NULL THEN
            UPDATE bookings 
            SET payment_status = 'PAID',
                transaction_id = p_transaction_id,
                status = 'CONFIRMED'
            WHERE id = v_booking_id;
            
            SET v_exit_code = 0; -- Thành công
            SELECT v_exit_code as status_code, v_booking_id as booking_id, v_owner_id as owner_id, 'Success' as message;
        ELSE
            SET v_exit_code = 2; -- Không tìm thấy booking khớp
            SELECT v_exit_code as status_code, NULL as booking_id, v_owner_id as owner_id, 'Booking not found' as message;
        END IF;
    END IF;
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
    COALESCE(SUM(b.final_amount), 0) as total_spent,
    COUNT(tp.id) as total_team_posts
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id AND b.payment_status = 'PAID'
LEFT JOIN team_posts tp ON u.id = tp.author_id
GROUP BY u.id;

-- Booking revenue by owner
CREATE VIEW owner_revenue AS
SELECT 
    co.id as owner_id,
    co.business_name,
    co.bank_account,
    COUNT(t.id) as total_transactions,
    COALESCE(SUM(t.amount), 0) as total_revenue,
    DATE(t.transaction_date) as transaction_date
FROM court_owners co
LEFT JOIN transactions t ON co.id = t.owner_id AND t.status = 'success'
GROUP BY co.id, DATE(t.transaction_date);

-- =====================================================
-- KẾT THÚC SCHEMA OPTIMIZED
-- ===================================================== 