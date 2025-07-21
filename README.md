# 🏸 Badminton Court Management System

Hệ thống quản lý sân cầu lông và pickleball toàn diện với backend Spring Boot và frontend Next.js.

## 📋 Tổng quan

Badminton Court Management System là một ứng dụng web đầy đủ cho phép:

-   **Người dùng**: Tìm kiếm, đặt sân, tạo đội chơi, quản lý lịch đặt sân
-   **Chủ sân**: Quản lý thông tin sân, giá cả, lịch trình, doanh thu
-   **Admin**: Quản lý toàn hệ thống

## 🚀 Demo

-   **Frontend**: [https://badminton-management-fe.vercel.app](https://badminton-management-fe.vercel.app)
-   **Backend API**: [https://api.badminton-management.com](https://api.badminton-management.com)
-   **API Documentation**: [Swagger UI](https://api.badminton-management.com/swagger-ui.html)

## 🛠️ Tech Stack

### Backend

-   **Framework**: Spring Boot 3.x
-   **Database**: PostgreSQL / MySQL
-   **Security**: JWT Authentication, Spring Security
-   **Documentation**: Swagger/OpenAPI 3
-   **Build Tool**: Maven

### Frontend

-   **Framework**: Next.js 14 (React)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **State Management**: React Context
-   **HTTP Client**: Axios
-   **Maps**: Leaflet

## 📂 Cấu trúc dự án

```
badminton_management/
├── BE/                          # Backend Spring Boot
│   ├── src/main/java/com/badminton/courtmanagement/
│   │   ├── config/             # Configuration classes
│   │   ├── controller/         # REST Controllers
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── entity/            # JPA Entities
│   │   ├── repository/        # Data repositories
│   │   ├── service/           # Business logic
│   │   └── utils/             # Utility classes
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── FE/                          # Frontend Next.js
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   ├── components/        # React components
│   │   ├── context/           # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # API clients & utilities
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json
├── database/                    # Database scripts
│   ├── schema-simple.sql      # Database schema
│   └── sample-data-simple.sql # Sample data
└── README.md                   # This file
```

## 🔥 Tính năng chính

### 👤 Người dùng

-   ✅ Đăng ký/Đăng nhập JWT
-   ✅ Tìm kiếm sân theo vị trí, môn thể thao, giá
-   ✅ Xem chi tiết sân với hình ảnh, tiện ích
-   ✅ Đặt sân theo giờ với xác nhận real-time
-   ✅ Quản lý lịch đặt sân cá nhân
-   ✅ Tạo/tham gia đội chơi
-   ✅ Chat với chủ sân
-   ✅ Đánh giá và review sân

### 🏢 Chủ sân

-   ✅ Dashboard quản lý sân
-   ✅ Thêm/sửa thông tin sân
-   ✅ Thiết lập giá theo khung giờ
-   ✅ Quản lý lịch đặt sân
-   ✅ Xem thống kê doanh thu
-   ✅ Chat với khách hàng

### 🔧 Admin

-   ✅ Quản lý người dùng
-   ✅ Quản lý sân
-   ✅ Thống kê hệ thống
-   ✅ Xử lý khiếu nại

## 🚀 Hướng dẫn cài đặt

### Prerequisites

-   Java 17+
-   Node.js 18+
-   PostgreSQL/MySQL
-   Maven 3.6+

### 1. Clone repository

```bash
git clone https://github.com/HoangLeAnhTuan/badminton_management.git
cd badminton_management
```

### 2. Setup Backend

```bash
cd BE

# Cấu hình database trong application.properties
# Chạy script tạo database
psql -U your_user -d your_database -f ../database/schema-simple.sql
psql -U your_user -d your_database -f ../database/sample-data-simple.sql

# Build và chạy
mvn clean install
mvn spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 3. Setup Frontend

```bash
cd FE

# Install dependencies
npm install

# Cấu hình environment variables
cp .env.example .env.local
# Chỉnh sửa API base URL trong .env.local

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Court Management

```
GET    /api/courts              # Danh sách sân
GET    /api/courts/{id}         # Chi tiết sân
POST   /api/courts              # Tạo sân mới (COURT_OWNER)
PUT    /api/courts/{id}         # Cập nhật sân
```

### Booking Management

```
GET    /api/bookings/my-bookings    # Booking của user
POST   /api/bookings                # Tạo booking mới
PATCH  /api/bookings/{id}/cancel    # Hủy booking
```

### Team Posts

```
GET    /api/team-posts              # Danh sách tìm đội
POST   /api/team-posts              # Tạo bài tìm đội
```

**Xem đầy đủ tại**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## 🗄️ Database Schema

### Các bảng chính:

-   `users` - Thông tin người dùng
-   `courts` - Thông tin sân
-   `court_owners` - Chủ sân
-   `bookings` - Đặt sân
-   `team_posts` - Bài đăng tìm đội
-   `team_members` - Thành viên đội

**Xem chi tiết**: [database/schema-simple.sql](database/schema-simple.sql)

## 🧪 Testing

### Backend Testing

```bash
cd BE
mvn test
```

### Frontend Testing

```bash
cd FE
npm test
npm run test:e2e
```

## 📦 Deployment

### Backend (Spring Boot)

```bash
# Build JAR
mvn clean package

# Run với production profile
java -jar target/badminton-court-management-1.0.0.jar --spring.profiles.active=prod
```

### Frontend (Next.js)

```bash
# Build production
npm run build

# Start production server
npm start
```

### Docker Support

```bash
# Build và chạy với Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📝 Changelog

### v1.0.0 (2024-01-15)

-   ✅ Initial release
-   ✅ User authentication & authorization
-   ✅ Court management system
-   ✅ Booking functionality
-   ✅ Team post features
-   ✅ Real-time notifications
-   ✅ Mobile responsive design

## 📞 Contact

-   **Developer**: Hoàng Lê Anh Tuấn
-   **Email**: hoangleanhtuan@example.com
-   **GitHub**: [@HoangLeAnhTuan](https://github.com/HoangLeAnhTuan)

## 📄 License

Dự án này sử dụng license [MIT](LICENSE).

## 🙏 Acknowledgments

-   Spring Boot community
-   Next.js team
-   Tailwind CSS
-   Leaflet mapping library
-   JWT.io

---

**⭐ Nếu dự án hữu ích, hãy cho một star nhé!**
# BAD_TEST
