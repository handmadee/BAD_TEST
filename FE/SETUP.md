# Frontend Setup Guide

## Đã sửa những gì:

### 1. ✅ **Package.json**

-   Đã tạo lại package.json đầy đủ với tất cả dependencies
-   Cài đặt đúng versions tương thích

### 2. ✅ **Dependencies đã cài đặt:**

-   `next@14.0.4` - Next.js framework
-   `react@^18` & `react-dom@^18` - React
-   `clsx@^2.0.0` - Class utility
-   `tailwind-merge@^2.0.0` - Tailwind CSS utility
-   `date-fns@^2.30.0` - Date utilities
-   `lucide-react@^0.294.0` - Icons
-   `react-hot-toast@^2.4.1` - Toast notifications
-   `react-date-range@^1.4.0` - Date picker
-   `react-image-gallery@^1.3.0` - Image gallery
-   `leaflet@^1.9.4` & `react-leaflet@4.2.1` - Maps
-   TypeScript types cho tất cả packages

## Cách chạy:

```bash
cd FE
npm run dev
```

## Kiểm tra:

1. **Server chạy thành công:** Mở http://localhost:3000
2. **Không có lỗi module:** Kiểm tra terminal không có lỗi "Module not found"
3. **Hot reload hoạt động:** Thay đổi file và xem trang tự động reload

## Nếu vẫn có lỗi:

### Lỗi "Module not found":

```bash
npm install [package-name]
```

### Lỗi TypeScript:

```bash
npm install --save-dev @types/[package-name]
```

### Lỗi build cache:

```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## Cấu trúc project:

```
FE/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   ├── context/       # React Context
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilities
│   ├── styles/        # CSS files
│   ├── types/         # TypeScript types
│   └── utils/         # Helper functions
├── public/            # Static assets
├── package.json       # Dependencies
├── next.config.js     # Next.js config
├── tailwind.config.js # Tailwind config
└── tsconfig.json      # TypeScript config
```

## Status: ✅ READY TO RUN
