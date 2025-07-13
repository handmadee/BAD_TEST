# 🏸 Database Documentation - VietQR Optimized System

## 📋 Tổng quan Database

Database MySQL được tối ưu cho hệ thống quản lý sân cầu lông và pickleball, tập trung vào **VietQR/Casso** làm phương thức thanh toán duy nhất. Thiết kế đơn giản nhưng đầy đủ chức năng cho frontend React/Next.js.

## 🗂️ Files

```
database/
├── schema-simple.sql          # Schema optimized cho VietQR
├── sample-data-simple.sql     # Dữ liệu test với VietQR URLs
└── README-simple.md          # Tài liệu này
```

## 📊 Danh sách bảng (14 bảng chính)

### 👤 **User Management**

-   `users` - Thông tin người dùng (có facebook_url)
-   `court_owners` - Chủ sân **với thông tin ngân hàng bắt buộc**
-   `user_favorites` - Sân yêu thích

### 🏟️ **Court Management**

-   `courts` - Thông tin sân (có facebook_url)
-   `court_pricing` - Bảng giá đơn giản (WEEKDAY/WEEKEND)

### 📅 **Booking & Payment (VietQR Only)**

-   `bookings` - Đặt sân (**chỉ VietQR**, có description + qr_url)
-   `transactions` - Webhook data từ Casso

### 👥 **Team & Community**

-   `team_posts` - Tìm đội
-   `team_members` - Thành viên

### ⭐ **Review & Communication**

-   `reviews` - Đánh giá sân (chỉ overall rating)
-   `messages` - Tin nhắn đơn giản
-   `notifications` - Thông báo

### 💰 **Promotions**

-   `discounts` - Mã giảm giá cơ bản
-   `discount_usages` - Lịch sử sử dụng

## 🚀 Cách sử dụng

### 1. Tạo Database

```bash
mysql -u root -p
source database/schema-simple.sql
source database/sample-data-simple.sql
```

### 2. Test với dữ liệu mẫu

```sql
-- Xem danh sách sân với thông tin ngân hàng
SELECT * FROM court_summary;

-- Xem user activity
SELECT * FROM user_activity;

-- Xem doanh thu theo owner
SELECT * FROM owner_revenue WHERE transaction_date >= '2024-03-01';

-- Tìm sân trống
CALL GetAvailableCourts('Đà Nẵng', '2024-04-01', '18:00:00', '20:00:00');

-- Test webhook processing
CALL ProcessCassoWebhook(
    140000,
    'Thanh toan san Thao Chi - 2h',
    'CASSO_TEST001',
    'Vietcombank',
    '1234567890',
    '2024-04-15 14:30:00'
);
```

## 🔧 Tính năng chính

### ✅ **VietQR Integration:**

-   **Chỉ VietQR** làm phương thức thanh toán
-   Thông tin ngân hàng **bắt buộc** cho court owners
-   QR URL được tạo sẵn trong sample data
-   Webhook processing với stored procedure
-   Description format chuẩn cho matching

### ✅ **Core Features:**

-   Đăng ký/đăng nhập users
-   Quản lý sân với pricing theo khung giờ
-   Booking system hoàn chỉnh
-   Team posts & messaging
-   Review & rating system
-   Discount codes
-   Notifications

### ❌ **Đã loại bỏ:**

-   Tất cả payment methods khác (VNPAY, MOMO, CASH)
-   Complex audit logs
-   Equipment rental
-   Tournament system
-   Coaching system
-   Loyalty points
-   Advanced analytics

## 📱 Tích hợp Frontend

### Key Features Support:

1. **Homepage** - Team posts với filters
2. **Courts Page** - Search, filter, pricing
3. **Booking** - VietQR only payment
4. **Admin Panel** - Court management
5. **Profile** - User management với social links
6. **Messages** - Basic messaging

### VietQR URLs Format:

```
https://img.vietqr.io/image/{bank_bin}-{account_number}-compact2.jpg?amount={amount}&addInfo={description}
```

## 🎯 Spring Boot Integration

### Entity Examples:

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private SkillLevel skillLevel;

    @Column(name = "facebook_url")
    private String facebookUrl;

    // Getters/Setters
}

@Entity
@Table(name = "court_owners")
public class CourtOwner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Banking info (REQUIRED)
    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "bank_account", nullable = false, unique = true)
    private String bankAccount;

    @Column(name = "bank_bin", nullable = false)
    private String bankBin;

    @Column(name = "account_holder_name", nullable = false)
    private String accountHolderName;
}

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description; // For Casso matching

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod = PaymentMethod.VIETQR;

    @Column(name = "qr_url")
    private String qrUrl;

    @Column(name = "transaction_id")
    private String transactionId;
}

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking; // Có thể null

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private CourtOwner owner;

    @Column(nullable = false)
    private Integer amount;

    @Column(nullable = false)
    private String description;

    @Column(name = "transaction_id", unique = true, nullable = false)
    private String transactionId;
}
```

### Repository Examples:

```java
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdAndPaymentStatus(Long userId, PaymentStatus status);

    @Query("SELECT b FROM Booking b WHERE b.courtId = :courtId AND b.status IN ('PENDING', 'CONFIRMED') AND b.bookingDate = :date AND NOT (b.endTime <= :startTime OR b.startTime >= :endTime)")
    List<Booking> findConflictingBookings(
        @Param("courtId") Long courtId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    List<Booking> findByDescriptionAndFinalAmountAndPaymentStatus(
        String description,
        BigDecimal amount,
        PaymentStatus status
    );
}

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByOwnerIdAndTransactionDateBetween(
        Long ownerId,
        LocalDateTime start,
        LocalDateTime end
    );

    Optional<Transaction> findByTransactionId(String transactionId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.owner.id = :ownerId AND t.status = 'success'")
    BigDecimal getTotalRevenueByOwner(@Param("ownerId") Long ownerId);
}
```

## 🎮 VietQR/Casso Workflow

### 1. Tạo Booking:

```java
// 1. Tạo booking với description chuẩn
String description = String.format("Thanh toan san %s - %.0fh",
    court.getName(), booking.getTotalHours());

// 2. Tạo QR URL
String qrUrl = String.format(
    "https://img.vietqr.io/image/%s-%s-compact2.jpg?amount=%d&addInfo=%s",
    owner.getBankBin(),
    owner.getBankAccount(),
    booking.getFinalAmount().intValue(),
    URLEncoder.encode(description, "UTF-8")
);

booking.setDescription(description);
booking.setQrUrl(qrUrl);
booking.setPaymentMethod(PaymentMethod.VIETQR);
```

### 2. Webhook Endpoint:

```java
@PostMapping("/api/webhook/casso")
public ResponseEntity<?> handleCassoWebhook(@RequestBody CassoWebhookDto webhook) {
    try {
        // Call stored procedure
        String result = jdbcTemplate.queryForObject(
            "CALL ProcessCassoWebhook(?, ?, ?, ?, ?, ?)",
            String.class,
            webhook.getAmount(),
            webhook.getDescription(),
            webhook.getTransactionId(),
            webhook.getBankName(),
            webhook.getAccountNumber(),
            webhook.getTransactionDate()
        );

        return ResponseEntity.ok(result);
    } catch (Exception e) {
        log.error("Webhook processing failed", e);
        return ResponseEntity.status(500).body("Processing failed");
    }
}
```

## 🔧 Configuration

### application.properties:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/badminton_management
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# VietQR Settings
vietqr.base-url=https://img.vietqr.io/image
vietqr.template=compact2
```

### Dependencies (pom.xml):

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
    </dependency>
</dependencies>
```

## 📊 Queries thường dùng

### VietQR/Casso Related:

```sql
-- Tìm booking chưa thanh toán
SELECT b.*, c.name, co.bank_account
FROM bookings b
JOIN courts c ON b.court_id = c.id
JOIN court_owners co ON c.owner_id = co.id
WHERE b.payment_status = 'PENDING';

-- Doanh thu theo chủ sân
SELECT co.business_name, co.bank_account,
       COUNT(t.id) as transactions,
       SUM(t.amount) as total_revenue
FROM court_owners co
LEFT JOIN transactions t ON co.id = t.owner_id AND t.status = 'success'
GROUP BY co.id;

-- Giao dịch chưa match được booking
SELECT t.* FROM transactions t
WHERE t.booking_id IS NULL;
```

## 🔧 Basic Maintenance

### Backup:

```bash
mysqldump -u root -p badminton_management > backup.sql
```

### Check VietQR Integration:

```sql
-- Kiểm tra số lượng records
SELECT
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM court_owners) as owners,
    (SELECT COUNT(*) FROM courts) as courts,
    (SELECT COUNT(*) FROM bookings) as bookings,
    (SELECT COUNT(*) FROM transactions) as transactions;

-- Kiểm tra owners có đầy đủ thông tin bank
SELECT business_name, bank_name, bank_account, bank_bin
FROM court_owners
WHERE bank_account IS NULL OR bank_bin IS NULL;

-- Kiểm tra bookings có QR URL
SELECT id, description, qr_url
FROM bookings
WHERE qr_url IS NULL AND payment_status = 'PENDING';
```

## 🎯 Next Steps

1. **Implement VietQR Service** trong Spring Boot
2. **Setup Casso Webhook** endpoint
3. **Test Payment Flow** end-to-end
4. **Add Real Bank BIN codes** từ VietQR API
5. **Monitoring Dashboard** cho transactions

## ⚠️ Lưu ý quan trọng

-   **Banking info là bắt buộc** cho court owners
-   **Chỉ VietQR** - không hỗ trợ payment methods khác
-   **Description format** phải nhất quán để webhook matching
-   **Transaction table** lưu tất cả webhook data, kể cả unmatched
-   **20 chủ sân** chỉ là ước lượng, có thể scale theo nhu cầu
