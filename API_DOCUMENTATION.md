# 🏸 Badminton Court Management - API Documentation

## 📋 Base Information

-   **Base URL:** `http://localhost:8081/api`
-   **Swagger UI:** `http://localhost:8081/api/swagger-ui.html`
-   **Authentication:** Bearer Token (JWT)

## 🔐 Authentication APIs

### 1. Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A",
  "phone": "0123456789",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Đăng ký thành công",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiJ9...",
        "refreshToken": "refresh_token_here",
        "userInfo": {
            "id": 1,
            "email": "user@example.com",
            "fullName": "Nguyen Van A",
            "role": "USER"
        }
    }
}
```

### 2. Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Get Current User

```http
GET /auth/me
Authorization: Bearer {token}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "user@example.com",
        "fullName": "Nguyen Van A",
        "phone": "0123456789",
        "role": "USER",
        "status": "ACTIVE"
    }
}
```

## 🏟️ Court Management APIs

### 1. Get All Courts

```http
GET /courts?page=0&size=20
```

**Response:**

```json
{
    "success": true,
    "data": {
        "content": [
            {
                "id": 1,
                "name": "Sân Cầu Lông ABC",
                "address": "123 Nguyễn Văn Linh, Đà Nẵng",
                "description": "Sân cầu lông chất lượng cao",
                "phone": "0123456789",
                "operatingHours": "6:00 - 22:00",
                "sportTypes": "Cầu lông",
                "averageRating": 4.5,
                "totalReviews": 120,
                "status": "ACTIVE",
                "images": ["image1.jpg", "image2.jpg"]
            }
        ],
        "totalElements": 50,
        "totalPages": 3,
        "number": 0,
        "size": 20
    }
}
```

### 2. Search Courts

```http
GET /courts/search?keyword=abc&sportType=Cầu lông&minRating=4.0&page=0&size=20
```

### 3. Get Court Details

```http
GET /courts/{id}
```

### 4. Create Court (COURT_OWNER only)

```http
POST /courts
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Sân Cầu Lông Mới",
  "address": "456 Lê Duẩn, Đà Nẵng",
  "description": "Sân cầu lông hiện đại",
  "phone": "0987654321",
  "email": "contact@court.com",
  "operatingHours": "6:00 - 22:00",
  "sportTypes": "Cầu lông",
  "amenities": "Điều hòa, Wifi, Đỗ xe",
  "images": ["image1.jpg", "image2.jpg"],
  "latitude": 16.0544,
  "longitude": 108.2022
}
```

## 👥 Team Post APIs

### 1. Get All Team Posts

```http
GET /team-posts?page=0&size=20
```

**Response:**

```json
{
    "success": true,
    "data": {
        "content": [
            {
                "id": 1,
                "user": {
                    "id": 1,
                    "fullName": "Nguyen Van A",
                    "email": "user@example.com"
                },
                "title": "Tìm đội chơi cầu lông",
                "description": "Tìm 2 người chơi cầu lông chiều chủ nhật",
                "playDate": "2024-01-20T14:00:00",
                "location": "Sân ABC, Đà Nẵng",
                "maxPlayers": 4,
                "currentPlayers": 2,
                "skillLevel": "Trung bình",
                "status": "OPEN",
                "isFull": false,
                "canJoin": true,
                "availableSlots": 2,
                "createdAt": "2024-01-15T10:00:00"
            }
        ],
        "totalElements": 30,
        "totalPages": 2,
        "number": 0,
        "size": 20
    }
}
```

### 2. Create Team Post

```http
POST /team-posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Tìm đội chơi cầu lông",
  "description": "Tìm 2 người chơi cầu lông chiều chủ nhật",
  "playDate": "2024-01-20T14:00:00",
  "location": "Sân ABC, Đà Nẵng",
  "maxPlayers": 4,
  "skillLevel": "Trung bình"
}
```

### 3. Search Team Posts

```http
GET /team-posts/search?keyword=cầu lông&sport=Cầu lông&skillLevel=Trung bình&location=Đà Nẵng&date=2024-01-20
```

### 4. Join Team

```http
POST /team-posts/{id}/join
Authorization: Bearer {token}
```

### 5. Get Team Members

```http
GET /team-posts/{id}/members
```

## 📅 Booking APIs

### 1. Create Booking

```http
POST /bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "courtId": 1,
  "bookingDate": "2024-01-20",
  "startTime": "14:00",
  "endTime": "16:00",
  "notes": "Đặt sân cho 4 người"
}
```

### 2. Get My Bookings

```http
GET /bookings/my-bookings?page=0&size=20
Authorization: Bearer {token}
```

### 3. Cancel Booking

```http
PATCH /bookings/{id}/cancel
Authorization: Bearer {token}
```

## 🔧 Integration Guide for Frontend

### 1. Setup API Client

```typescript
// api.ts
const API_BASE_URL = "http://localhost:8081/api";

class ApiClient {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
    }

    async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
            ...options.headers,
        };

        const response = await fetch(url, { ...options, headers });
        return response.json();
    }

    // Auth methods
    async login(email: string, password: string) {
        return this.request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }

    async getCurrentUser() {
        return this.request("/auth/me");
    }

    // Court methods
    async getCourts(params: any = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/courts?${query}`);
    }

    // Team post methods
    async getTeamPosts(params: any = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/team-posts?${query}`);
    }
}

export const apiClient = new ApiClient();
```

### 2. Authentication Flow

```typescript
// auth.ts
export const authService = {
    async login(email: string, password: string) {
        const response = await apiClient.login(email, password);
        if (response.success) {
            localStorage.setItem("token", response.data.token);
            apiClient.setToken(response.data.token);
        }
        return response;
    },

    async getCurrentUser() {
        const token = localStorage.getItem("token");
        if (token) {
            apiClient.setToken(token);
            return apiClient.getCurrentUser();
        }
        return null;
    },

    logout() {
        localStorage.removeItem("token");
        apiClient.setToken("");
    },
};
```

### 3. Error Handling

```typescript
// Handle API errors
try {
    const response = await apiClient.getCourts();
    if (!response.success) {
        throw new Error(response.message || "API Error");
    }
    return response.data;
} catch (error) {
    console.error("API Error:", error);
    // Handle error (show toast, redirect, etc.)
}
```

## 🎯 Next Steps

1. **Start Backend:** `mvn spring-boot:run` (port 8081)
2. **Access Swagger:** http://localhost:8081/api/swagger-ui.html
3. **Test APIs:** Use Postman or curl
4. **Integrate with FE:** Use the API client code above

## 📝 Notes

-   Tất cả APIs đều trả về format chuẩn với `success`, `message`, `data`
-   Authentication required cho các endpoints có 🔒
-   Pagination sử dụng Spring Boot format
-   Date format: `yyyy-MM-dd` hoặc `yyyy-MM-ddTHH:mm:ss`
