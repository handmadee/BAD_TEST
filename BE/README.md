# Badminton Court Management - Backend

## Cấu trúc Project

```
BE/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── badminton/
│       │           └── courtmanagement/
│       │               ├── BadmintonCourtManagementApplication.java
│       │               ├── config/
│       │               │   └── JpaConfig.java
│       │               ├── entity/
│       │               │   ├── BaseEntity.java
│       │               │   ├── User.java
│       │               │   ├── CourtOwner.java
│       │               │   └── Court.java
│       │               ├── dto/
│       │               │   └── UserDto.java
│       │               └── mapper/
│       │                   └── UserMapper.java
│       └── resources/
│           └── application.properties
├── pom.xml
└── README.md
```

## Dependencies đã thêm

### Lombok

-   **@Data**: Tự động tạo getter/setter, toString, equals, hashCode
-   **@Builder**: Pattern Builder cho object creation
-   **@NoArgsConstructor**: Constructor không tham số
-   **@AllArgsConstructor**: Constructor với tất cả tham số

### MapStruct

-   Mapping tự động giữa Entity và DTO
-   Type-safe và performance cao
-   Code generation tại compile time

## Cách sử dụng

### 1. Entity với Lombok

```java
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {
    // fields...
}
```

### 2. Tạo User với Builder Pattern

```java
User user = User.builder()
    .email("test@example.com")
    .fullName("Nguyễn Văn A")
    .role(User.UserRole.USER)
    .build();
```

### 3. Mapping với MapStruct

```java
@Autowired
private UserMapper userMapper;

UserDto dto = userMapper.toDto(user);
User entity = userMapper.toEntity(dto);
```

## Setup Database

1. Tạo database MySQL:

```sql
CREATE DATABASE badminton_court_management;
```

2. Cập nhật `application.properties`:

```properties
spring.datasource.password=your_actual_password
```

## Chạy Application

```bash
cd BE
mvn spring-boot:run
```

## Lỗi Package Declaration

Nếu gặp lỗi "declared package does not match expected package", đây là lỗi của IDE không ảnh hưởng đến việc compile và chạy application. Code vẫn hoạt động bình thường.

## API Endpoints

-   Server chạy tại: `http://localhost:8080/api`
-   Swagger UI (nếu có): `http://localhost:8080/api/swagger-ui.html`
