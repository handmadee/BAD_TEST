# API Client Documentation

Thư viện API client để tích hợp với backend Badminton Court Management.

## 📁 Cấu trúc Files

```
src/lib/
├── api-client.ts      # API client chính với authentication
├── auth-service.ts    # Service cho authentication
├── court-service.ts   # Service cho quản lý sân
├── team-service.ts    # Service cho team posts
├── booking-service.ts # Service cho booking
├── index.ts          # Export tất cả services
└── README.md         # File này
```

## 🚀 Cách sử dụng

### 1. Import services

```typescript
import {
    authService,
    courtService,
    teamService,
    bookingService,
    ApiError,
} from "@/lib";
```

### 2. Authentication

```typescript
// Đăng nhập
try {
    const response = await authService.login({
        email: "user@example.com",
        password: "password123",
    });

    if (response.success) {
        console.log("Đăng nhập thành công:", response.data.userInfo);
        // Token được lưu tự động vào localStorage
    }
} catch (error) {
    if (error instanceof ApiError) {
        console.error("Lỗi đăng nhập:", error.message);
    }
}

// Đăng ký
try {
    const response = await authService.register({
        email: "newuser@example.com",
        password: "password123",
        fullName: "Nguyen Van A",
        phone: "0123456789",
        dateOfBirth: "1990-01-01",
        gender: "MALE",
    });

    if (response.success) {
        console.log("Đăng ký thành công:", response.data.userInfo);
    }
} catch (error) {
    console.error("Lỗi đăng ký:", error.message);
}

// Lấy thông tin user hiện tại
try {
    const response = await authService.getCurrentUser();
    console.log("User hiện tại:", response.data);
} catch (error) {
    console.error("Chưa đăng nhập hoặc token hết hạn");
}

// Đăng xuất
authService.logout();
```

### 3. Court Management

```typescript
// Lấy danh sách sân
const courts = await courtService.getCourts({ page: 0, size: 20 });
console.log("Danh sách sân:", courts.data.content);

// Tìm kiếm sân
const searchResults = await courtService.searchCourts({
    keyword: "cầu lông",
    sportType: "Cầu lông",
    minRating: 4.0,
    page: 0,
    size: 20,
});

// Lấy thông tin chi tiết sân
const courtDetails = await courtService.getCourtById(1);

// Tạo sân mới (cần role COURT_OWNER)
const newCourt = await courtService.createCourt({
    name: "Sân Cầu Lông ABC",
    address: "123 Nguyễn Văn Linh, Đà Nẵng",
    description: "Sân cầu lông chất lượng cao",
    phone: "0123456789",
    operatingHours: "6:00 - 22:00",
    sportTypes: "Cầu lông",
});

// Tìm sân gần
const nearbyCourts = await courtService.getNearbyCourts({
    latitude: 16.0544,
    longitude: 108.2022,
    radius: 10, // km
});
```

### 4. Team Posts

```typescript
// Lấy danh sách bài đăng tìm đội
const teamPosts = await teamService.getTeamPosts({ page: 0, size: 20 });

// Tìm kiếm bài đăng
const searchPosts = await teamService.searchTeamPosts({
    keyword: "cầu lông",
    sport: "Cầu lông",
    skillLevel: "Trung bình",
    location: "Đà Nẵng",
});

// Tạo bài đăng mới
const newPost = await teamService.createTeamPost({
    title: "Tìm đội chơi cầu lông",
    description: "Tìm 2 người chơi cầu lông chiều chủ nhật",
    playDate: "2024-01-20T14:00:00",
    location: "Sân ABC, Đà Nẵng",
    maxPlayers: 4,
    skillLevel: "Trung bình",
});

// Tham gia đội
await teamService.joinTeam(1);

// Lấy danh sách thành viên
const members = await teamService.getTeamMembers(1);

// Chấp nhận thành viên (chỉ creator)
await teamService.acceptMember(1, 2);
```

### 5. Booking Management

```typescript
// Tạo booking mới
const newBooking = await bookingService.createBooking({
    courtId: 1,
    bookingDate: "2024-01-20",
    startTime: "14:00",
    endTime: "16:00",
    notes: "Đặt sân cho 4 người",
});

// Lấy danh sách booking của mình
const myBookings = await bookingService.getMyBookings({
    page: 0,
    size: 20,
    status: "CONFIRMED",
});

// Kiểm tra tính khả dụng
const availability = await bookingService.checkAvailability({
    courtId: 1,
    date: "2024-01-20",
    startTime: "14:00",
    endTime: "16:00",
});

if (availability.data.available) {
    console.log("Sân có sẵn");
} else {
    console.log("Sân đã được đặt:", availability.data.conflicts);
}

// Tính giá booking
const priceInfo = await bookingService.calculatePrice({
    courtId: 1,
    date: "2024-01-20",
    startTime: "14:00",
    endTime: "16:00",
});

console.log("Tổng giá:", priceInfo.data.totalPrice);

// Hủy booking
await bookingService.cancelBooking(1, "Có việc đột xuất");
```

## 🔧 Error Handling

```typescript
import { ApiError } from "@/lib";

try {
    const response = await courtService.getCourts();
    // Xử lý response thành công
} catch (error) {
    if (error instanceof ApiError) {
        switch (error.status) {
            case 401:
                console.error("Chưa đăng nhập hoặc token hết hạn");
                // Redirect to login
                break;
            case 403:
                console.error("Không có quyền truy cập");
                break;
            case 404:
                console.error("Không tìm thấy dữ liệu");
                break;
            case 500:
                console.error("Lỗi server");
                break;
            default:
                console.error("Lỗi:", error.message);
        }
    } else {
        console.error("Lỗi mạng:", error);
    }
}
```

## ⚙️ Configuration

### Environment Variables

Tạo file `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

### Interceptors

API client tự động xử lý:

-   Authentication headers
-   Token refresh khi hết hạn
-   Error handling
-   Request/response logging

## 🔄 Response Format

Tất cả APIs đều trả về format chuẩn:

```typescript
interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

// Với pagination
interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
```

## 📝 Notes

1. **Authentication**: Token được lưu tự động vào localStorage
2. **Auto Refresh**: Token sẽ được refresh tự động khi hết hạn
3. **Type Safety**: Tất cả APIs đều có TypeScript types
4. **Error Handling**: Sử dụng custom ApiError class
5. **Backward Compatibility**: Vẫn giữ mock API cũ để không break existing code

## 🚀 Migration từ Mock API

Để chuyển từ mock API sang real API:

```typescript
// Cũ (mock)
import { api } from "@/lib/api";
const courts = await api.getCourts();

// Mới (real API)
import { courtService } from "@/lib";
const response = await courtService.getCourts();
const courts = response.data;
```
