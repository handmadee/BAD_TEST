# 📋 Database Optimization Summary - VietQR Only System

## 🎯 Mục tiêu đã hoàn thành

✅ **Tối ưu database cho VietQR/Casso duy nhất**
✅ **Loại bỏ complexity không cần thiết**
✅ **Phù hợp với frontend React/Next.js hiện tại**
✅ **Hỗ trợ scale linh hoạt** (không fix cứng 20 chủ sân)

## 🗂️ Files còn lại (Clean & Optimized)

```
database/
├── schema-simple.sql          # Schema tối ưu cho VietQR (14 bảng)
├── sample-data-simple.sql     # Data mẫu với VietQR URLs thật
├── README-simple.md           # Documentation đầy đủ
└── SUMMARY.md                # File này
```

## 🏗️ Database Structure (14 bảng)

### Core Tables:

1. **users** - User management (có facebook_url)
2. **court_owners** - Chủ sân với banking info **BẮT BUỘC**
3. **courts** - Sân thể thao (có facebook_url)
4. **court_pricing** - Giá đơn giản (WEEKDAY/WEEKEND)
5. **bookings** - Đặt sân **chỉ VietQR** (có description + qr_url)
6. **transactions** - Webhook data từ Casso
7. **team_posts** - Tìm đội
8. **team_members** - Thành viên đội
9. **reviews** - Đánh giá (chỉ overall rating)
10. **messages** - Tin nhắn đơn giản
11. **notifications** - Thông báo
12. **user_favorites** - Sân yêu thích
13. **discounts** - Mã giảm giá
14. **discount_usages** - Lịch sử giảm giá

## 🚫 Đã loại bỏ

-   ❌ **Tất cả payment methods khác** (VNPAY, MOMO, CASH)
-   ❌ **Complex audit logs** system
-   ❌ **Equipment rental** tables
-   ❌ **Tournament management** system
-   ❌ **Coaching system** tables
-   ❌ **Loyalty points** complexity
-   ❌ **Migration scripts** phức tạp
-   ❌ **Advanced analytics** tables
-   ❌ **System settings** table

## 💳 VietQR Integration

### Banking Info Required:

```sql
-- Court owners MUST have banking info
bank_name VARCHAR(50) NOT NULL,           -- Vietcombank, Techcombank, etc.
bank_account VARCHAR(50) NOT NULL,        -- Số tài khoản
bank_bin VARCHAR(6) NOT NULL,             -- Mã BIN cho VietQR
account_holder_name VARCHAR(255) NOT NULL -- Tên chủ tài khoản
```

### QR URL Format:

```
https://img.vietqr.io/image/{bank_bin}-{account_number}-compact2.jpg?amount={amount}&addInfo={description}
```

### Description Format (for Casso matching):

```
"Thanh toan san {court_name} - {hours}h"
```

## 🔧 Key Features

### ✅ **Webhook Processing:**

-   Stored procedure `ProcessCassoWebhook()`
-   Automatic booking status update
-   Transaction logging với booking matching

### ✅ **Frontend Support:**

-   Homepage team posts
-   Courts search & filter
-   VietQR booking flow
-   Admin court management
-   User profiles với social links
-   Basic messaging

### ✅ **Performance:**

-   10+ strategic indexes
-   3 useful views (court_summary, user_activity, owner_revenue)
-   2 simple triggers (rating update, team count)

## 📊 Sample Data

-   **8 users** (admin, court owners, regular users)
-   **3 court owners** với banking info đầy đủ
-   **4 sân** tại Đà Nẵng và Hà Nội
-   **5 bookings** với VietQR URLs thật
-   **5 transactions** từ Casso webhook
-   **4 team posts** active
-   **Reviews, messages, notifications**
-   **3 discount codes**

## 🎯 Spring Boot Ready

### Entity Classes:

-   User, CourtOwner, Court, Booking, Transaction
-   Repository interfaces với custom queries
-   Webhook endpoint example
-   VietQR URL generation logic

### Configuration:

-   application.properties setup
-   Dependencies (Spring Boot + MySQL)
-   VietQR service configuration

## 🚀 Next Steps

1. **Implement VietQR Service** trong Spring Boot
2. **Setup Casso Webhook** endpoint
3. **Test payment flow** end-to-end
4. **Add monitoring** cho transactions
5. **Scale as needed** (không giới hạn 20 chủ sân)

## ⚠️ Important Notes

-   **Banking info BẮT BUỘC** cho court owners
-   **Chỉ VietQR** - no other payment methods
-   **Description format nhất quán** cho webhook matching
-   **Transaction table** lưu ALL webhook data
-   **Scalable design** - không fix cứng số lượng chủ sân

---

**Kết quả:** Database clean, optimized, production-ready cho VietQR-only system! 🎉
