-- =====================================================
-- SAMPLE DATA FOR OPTIMIZED VIETQR-ONLY SYSTEM
-- =====================================================

USE badminton_management;

-- =====================================================
-- 1. SAMPLE USERS
-- =====================================================
INSERT INTO users (username, email, phone, password_hash, full_name, date_of_birth, gender, bio, location, skill_level, preferred_sports, role, status, facebook_url) VALUES
('admin', 'admin@badminton.vn', '0901000000', '$2b$10$dummy_hash_admin', 'Quản trị viên', '1990-01-01', 'MALE', 'Quản trị viên hệ thống', 'Hà Nội', 'EXCELLENT', 'BADMINTON,PICKLEBALL', 'ADMIN', 'ACTIVE', NULL),

('thaochi', 'thaochi@gmail.com', '0901234567', '$2b$10$dummy_hash_thaochi', 'Nguyễn Thảo Chi', '1995-08-15', 'FEMALE', 'Chủ sân cầu lông tại Đà Nẵng', 'Đà Nẵng', 'GOOD', 'BADMINTON', 'COURT_OWNER', 'ACTIVE', 'https://facebook.com/thaochi'),

('minhhoang', 'minhhoang@gmail.com', '0907654321', '$2b$10$dummy_hash_minhhoang', 'Trần Minh Hoàng', '1992-03-22', 'MALE', 'Chủ sân thể thao', 'Đà Nẵng', 'EXCELLENT', 'PICKLEBALL,BADMINTON', 'COURT_OWNER', 'ACTIVE', 'https://facebook.com/minhhoang'),

('user1', 'user1@gmail.com', '0912345678', '$2b$10$dummy_hash_user1', 'Lê Văn Tùng', '1988-12-10', 'MALE', 'Người chơi cầu lông nghiệp dư', 'TP.HCM', 'GOOD', 'BADMINTON', 'USER', 'ACTIVE', NULL),

('user2', 'user2@gmail.com', '0923456789', '$2b$10$dummy_hash_user2', 'Phạm Thị Mai', '1993-05-20', 'FEMALE', 'Mới học chơi pickleball', 'Hà Nội', 'WEAK', 'PICKLEBALL', 'USER', 'ACTIVE', NULL),

('user3', 'user3@gmail.com', '0934567890', '$2b$10$dummy_hash_user3', 'Hoàng Minh Đức', '1990-11-08', 'MALE', 'Chơi cầu lông từ nhỏ', 'Đà Nẵng', 'PROFESSIONAL', 'BADMINTON', 'USER', 'ACTIVE', NULL),

('user4', 'user4@gmail.com', '0945678901', '$2b$10$dummy_hash_user4', 'Nguyễn Thị Lan', '1996-07-25', 'FEMALE', 'Thích vận động', 'TP.HCM', 'INTERMEDIATE', 'PICKLEBALL,BADMINTON', 'USER', 'ACTIVE', NULL),

('owner1', 'owner1@gmail.com', '0956789012', '$2b$10$dummy_hash_owner1', 'Võ Đình Nam', '1985-04-12', 'MALE', 'Chủ sở hữu sân thể thao', 'Hà Nội', 'ADVANCED', 'BADMINTON,PICKLEBALL', 'COURT_OWNER', 'ACTIVE', NULL);

-- =====================================================
-- 2. COURT OWNERS DATA (VietQR Banking Required)
-- =====================================================
INSERT INTO court_owners (user_id, business_name, business_phone, business_email, bank_name, bank_account, bank_bin, account_holder_name, verification_status, verified_at) VALUES
(2, 'Sân Cầu Lông Thảo Chi', '0901234567', 'business@thaochi.vn', 'Vietcombank', '1234567890', '970436', 'NGUYEN THAO CHI', 'VERIFIED', '2024-01-15 10:00:00'),
(3, 'Dragon Sports Center', '0907654321', 'contact@dragonsports.vn', 'Techcombank', '9876543210', '970407', 'TRAN MINH HOANG', 'VERIFIED', '2024-01-20 14:30:00'),
(8, 'Nam Sports Complex', '0956789012', 'info@namsports.vn', 'VietinBank', '5555666677', '970415', 'VO DINH NAM', 'VERIFIED', '2024-02-01 09:15:00');

-- =====================================================
-- 3. COURTS DATA
-- =====================================================
INSERT INTO courts (
    owner_id, name, description, address, city, district, 
    latitude, longitude, sport_types, total_courts,
    opening_time, closing_time, phone, email, facebook_url,
    amenities, average_rating, total_reviews, status, featured,
    images, cover_image
) VALUES 
(
    1, 'Sân Cầu Lông Hoàng Gia', 
    'Sân cầu lông cao cấp với trang thiết bị hiện đại, sàn gỗ chuẩn quốc tế.',
    '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM', 'TP.HCM', 'Quận 1',
    10.7622700, 106.6607200, 'BADMINTON', 8,
    '06:00:00', '23:00:00', '0901234567', 'hoanggia@badminton.vn', 'https://facebook.com/hoanggia',
    '["Điều hòa", "Wifi miễn phí", "Căn tin", "Bãi xe miễn phí", "Phòng thay đồ"]',
    4.7, 156, 'ACTIVE', true,
    '["court1.jpg", "court2.jpg"]', 'court1.jpg'
),
(
    2, 'Sân Cầu Lông Sài Gòn Sports', 
    'Sân cầu lông và pickleball chất lượng cao, phục vụ 24/7.',
    '456 Nguyễn Văn Cừ, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM', 'TP.HCM', 'Quận 1', 
    10.7644400, 106.6835500, 'BADMINTON,PICKLEBALL', 12,
    '00:00:00', '23:59:59', '0907654321', 'contact@sgnsports.vn', 'https://facebook.com/sgnsports',
    '["Điều hòa", "Wifi miễn phí", "Căn tin", "Bãi xe", "Phòng thay đồ", "Dịch vụ giặt ủi"]',
    4.5, 203, 'ACTIVE', true,
    '["court3.jpg", "court4.jpg"]', 'court3.jpg'
),
(
    1, 'Sân Cầu Lông Quận 3', 
    'Sân cầu lông giá rẻ, phù hợp với mọi lứa tuổi.',
    '789 Võ Văn Tần, Phường 6, Quận 3, TP.HCM', 'TP.HCM', 'Quận 3',
    10.7855600, 106.6891700, 'BADMINTON', 6,
    '05:30:00', '22:30:00', '0912345678', 'quan3@badminton.vn', NULL,
    '["Wifi miễn phí", "Bãi xe", "Nước uống"]',
    4.2, 89, 'ACTIVE', false,
    '["court5.jpg"]', 'court5.jpg'
),
(
    3, 'Elite Badminton Club', 
    'Câu lạc bộ cầu lông cao cấp với huấn luyện viên chuyên nghiệp.',
    '321 Pasteur, Phường 6, Quận 3, TP.HCM', 'TP.HCM', 'Quận 3',
    10.7755500, 106.6955500, 'BADMINTON', 4,
    '06:00:00', '22:00:00', '0923456789', 'elite@club.vn', 'https://facebook.com/eliteclub',
    '["Điều hòa", "Wifi miễn phí", "Huấn luyện viên", "Phòng thay đồ VIP", "Spa"]',
    4.9, 78, 'ACTIVE', true,
    '["court6.jpg", "court7.jpg"]', 'court6.jpg'
),
(
    2, 'Sân Pickleball Thủ Đức', 
    'Sân pickleball chuyên nghiệp tại khu vực Thủ Đức.',
    '147 Võ Văn Ngân, Phường Linh Chiểu, TP.Thủ Đức, TP.HCM', 'TP.HCM', 'TP.Thủ Đức',
    10.8476700, 106.7645300, 'PICKLEBALL', 10,
    '05:00:00', '23:00:00', '0934567890', 'thuduc@pickleball.vn', NULL,
    '["Điều hòa", "Wifi miễn phí", "Căn tin", "Bãi xe rộng"]',
    4.3, 45, 'ACTIVE', false,
    '["court8.jpg"]', 'court8.jpg'
);

-- =====================================================
-- 4. COURT PRICING DATA (Simplified)
-- =====================================================
INSERT INTO court_pricing (court_id, name, day_type, start_time, end_time, base_price, is_active) VALUES
-- Sân Thảo Chi
(1, 'Giá ngày thường', 'WEEKDAY', '06:00:00', '17:00:00', 50000, true),
(1, 'Giá giờ vàng', 'WEEKDAY', '17:00:00', '22:00:00', 70000, true),
(1, 'Giá cuối tuần', 'WEEKEND', '06:00:00', '22:00:00', 80000, true),

-- Sân Pickleball Modern
(2, 'Giá ngày thường', 'WEEKDAY', '05:30:00', '17:00:00', 40000, true),
(2, 'Giá giờ vàng', 'WEEKDAY', '17:00:00', '23:00:00', 60000, true),
(2, 'Giá cuối tuần', 'WEEKEND', '05:30:00', '23:00:00', 70000, true),

-- Sân Dragon
(3, 'Giá ngày thường', 'WEEKDAY', '05:00:00', '17:00:00', 55000, true),
(3, 'Giá giờ vàng', 'WEEKDAY', '17:00:00', '23:00:00', 75000, true),
(3, 'Giá cuối tuần', 'WEEKEND', '05:00:00', '23:00:00', 85000, true),

-- Nam Sports
(4, 'Giá ngày thường', 'WEEKDAY', '05:30:00', '17:00:00', 60000, true),
(4, 'Giá giờ vàng', 'WEEKDAY', '17:00:00', '23:30:00', 80000, true),
(4, 'Giá cuối tuần', 'WEEKEND', '05:30:00', '23:30:00', 90000, true);

-- =====================================================
-- 5. BOOKINGS DATA (VietQR Only)
-- =====================================================
INSERT INTO bookings (user_id, court_id, booking_date, start_time, end_time, sport_type, court_number, total_hours, price_per_hour, total_amount, final_amount, description, payment_status, payment_method, transaction_id, qr_url, status, confirmation_code, notes) VALUES
(4, 1, '2024-03-25', '14:00:00', '16:00:00', 'BADMINTON', 1, 2.0, 70000, 140000, 140000, 'Thanh toan san Thao Chi - 2h', 'PAID', 'VIETQR', 'CASSO001', 'https://img.vietqr.io/image/970436-1234567890-compact2.jpg?amount=140000&addInfo=Thanh%20toan%20san%20Thao%20Chi%20-%202h', 'CONFIRMED', 'BK001', 'Đặt sân cho nhóm bạn'),

(5, 2, '2024-03-28', '09:00:00', '11:00:00', 'PICKLEBALL', 1, 2.0, 40000, 80000, 80000, 'Thanh toan san Pickleball Modern - 2h', 'PAID', 'VIETQR', 'CASSO002', 'https://img.vietqr.io/image/970407-9876543210-compact2.jpg?amount=80000&addInfo=Thanh%20toan%20san%20Pickleball%20Modern%20-%202h', 'CONFIRMED', 'BK002', 'Luyện tập buổi sáng'),

(6, 3, '2024-03-15', '18:00:00', '20:00:00', 'BADMINTON', 2, 2.0, 75000, 150000, 150000, 'Thanh toan san Dragon Sports - 2h', 'PAID', 'VIETQR', 'CASSO003', 'https://img.vietqr.io/image/970407-9876543210-compact2.jpg?amount=150000&addInfo=Thanh%20toan%20san%20Dragon%20Sports%20-%202h', 'COMPLETED', 'BK003', 'Thi đấu giao hữu'),

(7, 1, '2024-03-30', '16:00:00', '18:00:00', 'BADMINTON', 2, 2.0, 70000, 140000, 140000, 'Thanh toan san Thao Chi - 2h', 'PAID', 'VIETQR', 'CASSO004', 'https://img.vietqr.io/image/970436-1234567890-compact2.jpg?amount=140000&addInfo=Thanh%20toan%20san%20Thao%20Chi%20-%202h', 'CONFIRMED', 'BK004', 'Chơi cùng bạn bè'),

(4, 4, '2024-04-02', '19:00:00', '21:00:00', 'BADMINTON', 3, 2.0, 80000, 160000, 160000, 'Thanh toan san Nam Sports Hanoi - 2h', 'PAID', 'VIETQR', 'CASSO005', 'https://img.vietqr.io/image/970415-5555666677-compact2.jpg?amount=160000&addInfo=Thanh%20toan%20san%20Nam%20Sports%20Hanoi%20-%202h', 'CONFIRMED', 'BK005', 'Tập luyện tối');

-- =====================================================
-- 6. TRANSACTIONS DATA (từ webhook Casso)
-- =====================================================
INSERT INTO transactions (booking_id, owner_id, amount, description, transaction_id, bank_name, account_number, transaction_date, status) VALUES
(1, 1, 140000, 'Thanh toan san Thao Chi - 2h', 'CASSO001', 'Vietcombank', '1234567890', '2024-03-24 10:30:00', 'success'),
(2, 2, 80000, 'Thanh toan san Pickleball Modern - 2h', 'CASSO002', 'Techcombank', '9876543210', '2024-03-27 15:45:00', 'success'),
(3, 2, 150000, 'Thanh toan san Dragon Sports - 2h', 'CASSO003', 'Techcombank', '9876543210', '2024-03-14 20:15:00', 'success'),
(4, 1, 140000, 'Thanh toan san Thao Chi - 2h', 'CASSO004', 'Vietcombank', '1234567890', '2024-03-29 14:20:00', 'success'),
(5, 3, 160000, 'Thanh toan san Nam Sports Hanoi - 2h', 'CASSO005', 'VietinBank', '5555666677', '2024-04-01 18:30:00', 'success');

-- =====================================================
-- 7. TEAM POSTS DATA
-- =====================================================
INSERT INTO team_posts (author_id, court_id, title, content, sport_type, skill_level, play_date, start_time, end_time, needed_players, current_players, cost_per_person, status) VALUES
(4, 1, 'Tìm 2 bạn chơi cầu lông chiều CN', 'Mình đã book sân Thảo Chi chiều CN. Tìm 2 bạn nữa để chơi đôi!', 'BADMINTON', 'INTERMEDIATE', '2024-04-07', '14:00:00', '16:00:00', 2, 2, 35000, 'ACTIVE'),

(6, 3, 'Cầu lông Dragon - Tối thứ 2', 'Có ai muốn chơi cầu lông tối thứ 2 không? Cần 3 người nữa.', 'BADMINTON', 'ADVANCED', '2024-04-08', '18:00:00', '20:00:00', 3, 1, 42500, 'ACTIVE'),

(5, 2, 'Pickleball sáng T7', 'Ai thích pickleball không? Buổi sáng T7 tại sân Modern. Newbie welcome!', 'PICKLEBALL', 'BEGINNER', '2024-04-06', '09:00:00', '11:00:00', 3, 2, 23000, 'ACTIVE'),

(7, 4, 'Cầu lông Hà Nội', 'Tìm team chơi cầu lông thường xuyên tại Nam Sports Hà Nội!', 'BADMINTON', 'INTERMEDIATE', '2024-04-10', '19:00:00', '21:00:00', 5, 1, 45000, 'ACTIVE');

-- =====================================================
-- 8. TEAM MEMBERS DATA
-- =====================================================
INSERT INTO team_members (post_id, user_id, status, role, join_message, approved_at) VALUES
-- Team post 1
(1, 4, 'APPROVED', 'ORGANIZER', 'Tôi là người tạo nhóm', NOW()),
(1, 6, 'APPROVED', 'MEMBER', 'Mình muốn tham gia!', NOW()),

-- Team post 2  
(2, 6, 'APPROVED', 'ORGANIZER', 'Tôi là người tạo nhóm', NOW()),

-- Team post 3
(3, 5, 'APPROVED', 'ORGANIZER', 'Tôi là người tạo nhóm', NOW()),
(3, 7, 'APPROVED', 'MEMBER', 'Mình mới học, được không?', NOW()),

-- Team post 4
(4, 7, 'APPROVED', 'ORGANIZER', 'Tôi là người tạo nhóm', NOW());

-- =====================================================
-- 9. REVIEWS DATA
-- =====================================================
INSERT INTO reviews (court_id, user_id, booking_id, overall_rating, title, comment, visit_date, sport_played, would_recommend, status) VALUES
(1, 4, 1, 5, 'Sân rất tốt!', 'Sân Thảo Chi có chất lượng rất tốt. Ánh sáng đầy đủ, mặt sân êm. Sẽ quay lại!', '2024-03-25', 'BADMINTON', true, 'PUBLISHED'),

(2, 5, 2, 4, 'Giá tốt cho pickleball', 'Sân pickleball Modern có giá khá hợp lý. Chất lượng ổn, không gian thoáng mát.', '2024-03-28', 'PICKLEBALL', true, 'PUBLISHED'),

(3, 6, 3, 5, 'Sân chuyên nghiệp', 'Sân Dragon thực sự chuyên nghiệp. Chất lượng rất cao, phù hợp cho thi đấu.', '2024-03-15', 'BADMINTON', true, 'PUBLISHED'),

(4, 7, 5, 4, 'Vị trí thuận tiện', 'Nam Sports Hà Nội ở vị trí thuận tiện, dễ tìm. Chất lượng tốt, giá phải chăng.', '2024-04-02', 'BADMINTON', true, 'PUBLISHED');

-- =====================================================
-- 10. MESSAGES DATA
-- =====================================================
INSERT INTO messages (sender_id, receiver_id, message_type, content, related_court_id, is_read) VALUES
(4, 2, 'TEXT', 'Chào chị, em muốn hỏi về lịch trống của sân vào cuối tuần ạ', 1, true),
(2, 4, 'TEXT', 'Chào em! Cuối tuần này sân còn trống từ 8-10h và 20-22h nhé.', 1, true),
(4, 2, 'TEXT', 'Em book slot 8-10h sáng CN được không ạ?', 1, true),
(2, 4, 'TEXT', 'Được em, chị sẽ giữ slot đó cho em!', 1, false),

(6, 3, 'TEXT', 'Anh ơi, sân Dragon có thể đặt trước bao lâu vậy ạ?', 3, true),
(3, 6, 'TEXT', 'Sân Dragon có thể đặt trước 30 ngày em nhé!', 3, true);

-- =====================================================
-- 11. NOTIFICATIONS DATA
-- =====================================================
INSERT INTO notifications (user_id, type, title, content, related_court_id, related_booking_id, is_read) VALUES
(4, 'BOOKING_CONFIRMED', 'Đặt sân thành công', 'Bạn đã đặt sân Cầu Lông Thảo Chi thành công cho ngày 25/03/2024', 1, 1, true),
(5, 'BOOKING_CONFIRMED', 'Đặt sân thành công', 'Bạn đã đặt sân Pickleball Modern thành công cho ngày 28/03/2024', 2, 2, true),
(6, 'BOOKING_CONFIRMED', 'Đặt sân thành công', 'Bạn đã đặt sân Dragon thành công cho ngày 15/03/2024', 3, 3, true),
(4, 'PAYMENT_SUCCESS', 'Thanh toán thành công', 'Thanh toán VietQR cho booking BK001 đã thành công', 1, 1, true),
(2, 'REVIEW_RECEIVED', 'Đánh giá mới', 'Sân của bạn nhận được đánh giá 5 sao từ khách hàng', 1, NULL, false);

-- =====================================================
-- 12. USER FAVORITES DATA
-- =====================================================
INSERT INTO user_favorites (user_id, court_id) VALUES
(4, 1), -- User1 yêu thích sân Thảo Chi
(4, 3), -- User1 yêu thích sân Dragon
(5, 2), -- User2 yêu thích sân Pickleball Modern
(6, 3), -- User3 yêu thích sân Dragon
(7, 1); -- User4 yêu thích sân Thảo Chi

-- =====================================================
-- 13. DISCOUNTS DATA
-- =====================================================
INSERT INTO discounts (code, name, description, type, value, usage_limit, valid_from, valid_until, min_booking_amount, is_active) VALUES
('WELCOME20', 'Ưu đãi người dùng mới', 'Giảm 20% cho lần đặt sân đầu tiên', 'PERCENTAGE', 20.00, 100, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 50000, true),
('WEEKEND10', 'Giảm giá cuối tuần', 'Giảm 10% cho booking cuối tuần', 'PERCENTAGE', 10.00, NULL, '2024-03-01 00:00:00', '2024-06-30 23:59:59', 100000, true),
('FRIEND50K', 'Ưu đãi bạn bè', 'Giảm 50k khi đặt sân cùng bạn', 'FIXED_AMOUNT', 50000, 50, '2024-02-01 00:00:00', '2024-05-31 23:59:59', 150000, true);

-- =====================================================
-- 14. DISCOUNT USAGES DATA
-- =====================================================
INSERT INTO discount_usages (discount_id, user_id, booking_id, discount_amount) VALUES
(1, 4, 1, 28000), -- 20% of 140000
(2, 5, 2, 8000);  -- 10% of 80000

-- =====================================================
-- UPDATE COMPUTED FIELDS
-- =====================================================

-- Update login counts
UPDATE users SET last_login = DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) WHERE id <= 8;

-- Update email verification
UPDATE users SET email_verified = true WHERE status = 'ACTIVE';

-- =====================================================
-- END OF OPTIMIZED SAMPLE DATA
-- ===================================================== 