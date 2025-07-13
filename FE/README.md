# 🏸 Badminton Court Management System

Hệ thống quản lý sân cầu lông được xây dựng với Next.js, TypeScript và TailwindCSS. Dự án hỗ trợ cả cầu lông và pickleball với đầy đủ tính năng từ đặt sân đến quản lý đội nhóm.

## 🎯 Tính năng chính

### 👤 Dành cho User:

-   ✅ Đăng ký/Đăng nhập (sẵn sàng tích hợp OTP)
-   ✅ Xem danh sách sân cầu lông/pickleball
-   ✅ Tìm kiếm và lọc sân theo khu vực
-   ✅ Xem chi tiết sân với hình ảnh và tiện ích
-   ✅ Bản đồ tương tác với Leaflet
-   ✅ Đặt lịch sân với pricing động theo khung giờ
-   ✅ Quản lý lịch đã đặt
-   ✅ Tạo và tham gia đội/nhóm chơi
-   ✅ Nhắn tin với admin/chủ sân
-   ✅ Quản lý thông tin cá nhân

### 🏢 Dành cho Admin (Chủ sân):

-   ✅ Dashboard tổng quan thống kê
-   ✅ Tạo sân mới với đầy đủ thông tin
-   ✅ Quản lý danh sách sân hiện có
-   ✅ Quản lý đặt lịch và booking
-   ✅ Xem báo cáo doanh thu
-   ✅ Nhắn tin với khách hàng
-   ✅ Thiết lập pricing theo khung giờ

## 🛠️ Công nghệ sử dụng

### Frontend

-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS
-   **State Management**: React Context + useReducer
-   **Maps**: React Leaflet
-   **HTTP Client**: Mock API (sẵn sàng tích hợp Axios)
-   **UI Components**: Custom components với TailwindCSS
-   **Icons**: Lucide React
-   **Date Handling**: date-fns

### Backend (Chuẩn bị)

-   **Framework**: Spring Boot 3.x
-   **Language**: Java 17+
-   **Database**: PostgreSQL/MySQL
-   **ORM**: Spring Data JPA
-   **Security**: Spring Security + JWT
-   **Documentation**: Swagger/OpenAPI
-   **Testing**: JUnit 5 + Mockito

## 📁 Cấu trúc dự án

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── admin/             # Trang quản trị
│   ├── auth/              # Authentication pages
│   ├── courts/            # Danh sách và chi tiết sân
│   ├── create-team/       # Tạo đội/nhóm
│   ├── dashboard/         # Dashboard người dùng
│   ├── messages/          # Tin nhắn
│   ├── my-bookings/       # Lịch đã đặt
│   └── profile/           # Thông tin cá nhân
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── context/              # React Context
│   ├── AuthContext.tsx   # Authentication state
│   └── CourtsContext.tsx # Courts data management
├── hooks/                # Custom hooks
├── lib/                  # API và utilities
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── styles/               # Global styles
```

## 🚀 Cài đặt và chạy dự án

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd badminton-court-management
```

### Bước 2: Cài đặt dependencies

```bash
npm install
# hoặc
bun install
```

### Bước 3: Thiết lập biến môi trường

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### Bước 4: Chạy development server

```bash
npm run dev
# hoặc
bun dev
```

Mở [http://localhost:3000](http://localhost:3000) trong browser.

## 📊 Tính năng hiện có

### ✅ Đã hoàn thành

-   [x] Trang chủ với danh sách bài đăng team
-   [x] Danh sách sân với bản đồ
-   [x] Chi tiết sân với hình ảnh gallery
-   [x] Tạo team/nhóm chơi
-   [x] Dashboard user với thống kê
-   [x] Admin dashboard với quản lý sân
-   [x] Responsive design cho mobile
-   [x] Context API cho state management
-   [x] Real API integration với Spring Boot Backend

### 🔄 Đang phát triển

-   [ ] Authentication với OTP
-   [ ] Payment integration (VNPay)
-   [ ] Real-time messaging
-   [ ] Push notifications
-   [ ] Unit tests

### 📋 Roadmap

-   [x] Backend API với Spring Boot
-   [x] Database design và migration
-   [x] JWT authentication
-   [x] Real-time API integration
-   [ ] File upload cho hình ảnh
-   [ ] Email notifications
-   [ ] Payment integration (VietQR)
-   [ ] Analytics và reporting
-   [ ] Mobile app (React Native)

## 🎨 Design System

### Colors

-   **Primary**: Red (#ef4444)
-   **Secondary**: Gray (#6b7280)
-   **Success**: Green (#10b981)
-   **Warning**: Yellow (#f59e0b)
-   **Danger**: Red (#ef4444)

### Typography

-   **Font**: Inter (Google Fonts)
-   **Sizes**: text-sm, text-base, text-lg, text-xl, text-2xl

## 🔧 Scripts có sẵn

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Chạy ESLint
npm run type-check   # Check TypeScript
```

## 🧪 Testing

```bash
npm run test         # Chạy unit tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 📱 Responsive Design

Ứng dụng được thiết kế responsive với breakpoints:

-   **Mobile**: < 768px
-   **Tablet**: 768px - 1024px
-   **Desktop**: > 1024px

## 🔐 Security

-   Input validation cho tất cả forms
-   XSS protection với proper sanitization
-   CSRF protection (sẵn sàng)
-   Rate limiting cho API calls
-   Secure HTTP headers

## 🌟 Tính năng nổi bật

### 🗺️ Bản đồ tương tác

-   Hiển thị vị trí sân trên bản đồ
-   Tính khoảng cách từ vị trí hiện tại
-   Custom markers cho từng loại sân

### 💰 Pricing động

-   Giá theo khung giờ và ngày trong tuần
-   Giờ vàng và giờ thường
-   Tính toán tự động tổng tiền

### 📅 Booking system

-   Chọn ngày và giờ
-   Kiểm tra availability real-time
-   Booking confirmation

### 👥 Team management

-   Tạo team theo skill level
-   Tìm đối thủ cùng trình độ
-   Chat trong team

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Docker

```bash
docker build -t badminton-app .
docker run -p 3000:3000 badminton-app
```

### Traditional hosting

```bash
npm run build
npm run start
```

## 📚 Chuẩn bị kiến thức Backend (Spring Boot)

### 🎯 Roadmap học Spring Boot

#### 1. Java Fundamentals (2-3 tuần)

-   ✅ Java 17+ features
-   ✅ OOP principles
-   ✅ Collections Framework
-   ✅ Exception Handling
-   ✅ Generics và Lambda
-   ✅ Stream API

#### 2. Spring Core (2 tuần)

-   ✅ Dependency Injection
-   ✅ IoC Container
-   ✅ Bean lifecycle
-   ✅ Configuration (Annotation vs XML)
-   ✅ Spring Boot Auto-configuration

#### 3. Spring Boot Basics (2 tuần)

-   ✅ Project structure
-   ✅ Application properties
-   ✅ Starter dependencies
-   ✅ Actuator
-   ✅ Profiles

#### 4. Web Development (3 tuần)

-   ✅ RESTful APIs
-   ✅ @RestController, @RequestMapping
-   ✅ Request/Response handling
-   ✅ Validation
-   ✅ Exception handling
-   ✅ CORS configuration

#### 5. Data Access (3 tuần)

-   ✅ Spring Data JPA
-   ✅ Entity relationships
-   ✅ Repository pattern
-   ✅ Query methods
-   ✅ Transactions
-   ✅ Database migrations

#### 6. Security (2 tuần)

-   ✅ Spring Security
-   ✅ JWT Authentication
-   ✅ Authorization
-   ✅ CSRF protection
-   ✅ Password encoding

#### 7. Testing (1 tuần)

-   ✅ Unit testing với JUnit 5
-   ✅ Mockito
-   ✅ Integration testing
-   ✅ Test slices (@WebMvcTest, @DataJpaTest)

#### 8. Advanced Topics (2 tuần)

-   ✅ Microservices
-   ✅ Spring Cloud
-   ✅ Messaging (RabbitMQ/Kafka)
-   ✅ Caching
-   ✅ Monitoring và Logging

### 📖 Tài liệu học tập

#### Books

1. **"Spring Boot in Action"** - Craig Walls
2. **"Spring Boot: Up and Running"** - Mark Heckler
3. **"Learning Spring Boot 3.0"** - Greg L. Turnquist

#### Online Courses

1. **Udemy**: "Spring & Hibernate for Beginners"
2. **Coursera**: "Spring Framework"
3. **Pluralsight**: "Spring Boot Fundamentals"

#### Documentation

1. [Spring Boot Reference](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/)
2. [Spring Framework Reference](https://docs.spring.io/spring-framework/docs/current/reference/html/)
3. [Spring Security Reference](https://docs.spring.io/spring-security/reference/)

### 🛠️ Practice Projects

#### Beginner

1. **TODO API** - CRUD operations
2. **User Management** - Authentication & Authorization
3. **Blog API** - với Comments và Categories

#### Intermediate

1. **E-commerce API** - Products, Orders, Payments
2. **Social Media API** - Posts, Friends, Messaging
3. **Booking System** - Hotels/Courts booking

#### Advanced

1. **Microservices** - với Spring Cloud
2. **Real-time Chat** - WebSocket + Messaging
3. **Payment Gateway** - Integration với VNPay/Stripe

### 🔧 Development Tools

#### IDE

-   **IntelliJ IDEA** (Recommended)
-   **Eclipse** with STS
-   **VS Code** with Java extensions

#### Database

-   **PostgreSQL** (Production)
-   **H2** (Development/Testing)
-   **MySQL** (Alternative)

#### Tools

-   **Postman** - API testing
-   **Docker** - Containerization
-   **Maven/Gradle** - Build tools
-   **Git** - Version control

### 📈 Best Practices

#### Code Quality

-   ✅ SOLID principles
-   ✅ Clean Code practices
-   ✅ Design patterns
-   ✅ Code documentation
-   ✅ Unit testing (80%+ coverage)

#### Architecture

-   ✅ Layered architecture
-   ✅ Separation of concerns
-   ✅ RESTful API design
-   ✅ Error handling
-   ✅ Logging strategy

#### Security

-   ✅ Input validation
-   ✅ SQL injection prevention
-   ✅ XSS protection
-   ✅ Authentication & Authorization
-   ✅ HTTPS everywhere

#### Performance

-   ✅ Database optimization
-   ✅ Caching strategy
-   ✅ Connection pooling
-   ✅ Lazy loading
-   ✅ Pagination

## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

### Quy tắc đóng góp

-   Code phải có unit tests
-   Follow coding standards
-   Update documentation
-   Squash commits trước khi merge

## 📝 Changelog

### v1.0.0 (Current)

-   ✅ Admin dashboard với quản lý sân
-   ✅ Responsive design
-   ✅ Mock API integration
-   ✅ Context state management

### v0.9.0

-   ✅ Team creation system
-   ✅ Court details với pricing
-   ✅ Interactive maps
-   ✅ User dashboard

### v0.8.0

-   ✅ Court listing với filters
-   ✅ Homepage với posts
-   ✅ Basic routing
-   ✅ UI components

## 📄 License

MIT License - xem [LICENSE](LICENSE) file để biết chi tiết.

## 📞 Liên hệ

-   **Developer**: Your Name
-   **Email**: your.email@example.com
-   **Project Link**: [GitHub Repository](https://github.com/username/badminton-court-management)

## 🙏 Acknowledgments

-   [Next.js](https://nextjs.org/) - React framework
-   [TailwindCSS](https://tailwindcss.com/) - CSS framework
-   [Leaflet](https://leafletjs.com/) - Interactive maps
-   [Lucide](https://lucide.dev/) - Beautiful icons
-   [Vercel](https://vercel.com/) - Deployment platform

---

**Made with ❤️ by the Badminton Community**
