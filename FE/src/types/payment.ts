export type PaymentType = "TOP_UP" | "BOOKING" | "WITHDRAWAL";

export type PaymentStatus =
  | "PENDING" // Đang chờ thanh toán
  | "PROCESSING" // Đang xử lý
  | "WAITING_APPROVAL" // Chờ admin duyệt
  | "COMPLETED" // Thành công
  | "FAILED" // Thất bại
  | "EXPIRED" // Hết hạn
  | "CANCELLED"; // Đã hủy

export type PaymentMethod =
  | "VIET_QR" // VietQR
  | "ADMIN_APPROVAL" // Admin duyệt thủ công
  | "MOMO" // MoMo
  | "ZALOPAY" // ZaloPay
  | "BANKING"; // Chuyển khoản

export interface PaymentRequest {
  id: string;
  userId: number;
  type: PaymentType;
  method: PaymentMethod;
  amount: number;
  description: string;
  status: PaymentStatus;

  // QR Code data
  qrCode?: string;
  qrText?: string;
  bankAccount?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    content: string;
  };

  // Timing
  createdAt: string;
  expiresAt: string;
  processingStartedAt?: string;
  completedAt?: string;

  // Metadata
  metadata?: {
    orderId?: string;
    transactionId?: string;
    adminNote?: string;
    failureReason?: string;
    [key: string]: any;
  };
}

export interface QRPaymentData {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
  qrString: string;
}

export interface PaymentProcessingState {
  request: PaymentRequest;
  timeRemaining: number; // seconds
  isExpired: boolean;
  canComplete: boolean; // Có thể nhấn M để complete
}

// Mock bank accounts for demo
export const DEMO_BANK_ACCOUNTS = {
  VIETCOMBANK: {
    bankCode: "VCB",
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "CONG TY BADMINTON APP",
    swiftCode: "BFTVVNVX",
  },
  TECHCOMBANK: {
    bankCode: "TCB",
    bankName: "Techcombank",
    accountNumber: "0987654321",
    accountName: "CONG TY BADMINTON APP",
    swiftCode: "VTCBVNVX",
  },
};

export const PAYMENT_CONFIG = {
  TIMEOUT_MINUTES: 10,
  QR_REFRESH_INTERVAL: 30000, // 30 seconds
  STATUS_CHECK_INTERVAL: 5000, // 5 seconds
  HOTKEY_COMPLETE: "KeyM",
  MIN_AMOUNT: 10000,
  MAX_AMOUNT: 50000000,
};
