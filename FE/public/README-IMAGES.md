# Hướng dẫn thêm ảnh

## 📁 Cấu trúc thư mục ảnh:

```
public/
├── avatars/           # Ảnh đại diện người dùng
│   ├── thaochi.jpg
│   └── minhhoang.jpg
├── posts/             # Ảnh bài đăng
│   ├── post1.jpg
│   └── post2.jpg
├── courts/            # Ảnh sân thể thao
│   ├── court1.jpg
│   ├── court2.jpg
│   └── court-placeholder.jpg
└── logos/             # Logo và biểu tượng
    └── logo.png
```

## 🖼️ Kích thước ảnh khuyến nghị:

-   **Avatars**: 150x150px (vuông)
-   **Posts**: 400x300px (4:3)
-   **Courts**: 400x300px (4:3)
-   **Logo**: 200x50px

## 📝 Định dạng file:

-   JPG, PNG, WebP
-   Kích thước file < 1MB

## 🔄 Để thay đổi từ Unsplash sang ảnh local:

1. **Thêm ảnh vào thư mục tương ứng**
2. **Cập nhật đường dẫn trong `src/lib/api.ts`**:

```typescript
// Thay đổi từ:
avatar: 'https://images.unsplash.com/photo-xxx',

// Thành:
avatar: '/avatars/thaochi.jpg',
```

## 🎯 Ảnh cần thiết ngay:

1. `/avatars/thaochi.jpg` - Avatar của Thảo Chi
2. `/avatars/minhhoang.jpg` - Avatar của Minh Hoàng
3. `/courts/court-placeholder.jpg` - Ảnh placeholder cho sân

**Lưu ý**: Hiện tại đang dùng Unsplash placeholder, bạn có thể giữ nguyên hoặc thay bằng ảnh riêng.
