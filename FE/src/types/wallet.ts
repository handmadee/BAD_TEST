export type TransactionType =
  | "BOOKING_PAYMENT" // Thanh toán đặt sân
  | "REFUND" // Hoàn tiền
  | "TOP_UP" // Nạp tiền
  | "WITHDRAWAL" // Rút tiền
  | "BONUS" // Thưởng/khuyến mãi
  | "PENALTY" // Phạt (hủy sân muộn, etc.)
  | "CASHBACK" // Hoàn tiền từ chương trình
  | "TRANSFER_IN" // Nhận chuyển khoản
  | "TRANSFER_OUT"; // Chuyển tiền cho người khác

export type TransactionStatus =
  | "PENDING" // Đang xử lý
  | "COMPLETED" // Hoàn thành
  | "FAILED" // Thất bại
  | "CANCELLED" // Đã hủy
  | "REFUNDED"; // Đã hoàn tiền

export type PaymentMethod =
  | "WALLET" // Ví nội bộ
  | "MOMO" // Ví MoMo
  | "BANKING" // Chuyển khoản ngân hàng
  | "ZALOPAY" // ZaloPay
  | "CASH" // Tiền mặt
  | "CREDIT_CARD" // Thẻ tín dụng
  | "VISA" // Visa
  | "MASTERCARD"; // Mastercard

export interface Transaction {
  id: string;
  userId: number;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  balance: number; // Số dư sau giao dịch
  description: string;
  paymentMethod?: PaymentMethod;
  reference?: string; // Mã tham chiếu (booking ID, etc.)
  metadata?: {
    bookingId?: number;
    courtName?: string;
    recipientName?: string;
    bankAccount?: string;
    promotionCode?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
}

export interface Wallet {
  id: string;
  userId: number;
  balance: number;
  lockedBalance: number; // Số tiền bị khóa (pending transactions)
  totalEarned: number; // Tổng tiền đã kiếm được
  totalSpent: number; // Tổng tiền đã chi tiêu
  currency: string; // VND, USD, etc.
  status: "ACTIVE" | "SUSPENDED" | "LOCKED";
  lastTransactionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletStats {
  totalTransactions: number;
  thisMonthTransactions: number;
  totalIncome: number;
  totalExpense: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  averageTransaction: number;
  largestTransaction: number;
  favoritePaymentMethod: PaymentMethod | null;
  transactionsByType: Record<TransactionType, number>;
  monthlyTrend: {
    month: string;
    income: number;
    expense: number;
    transactions: number;
  }[];
}

export interface TopUpRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface WithdrawalRequest {
  amount: number;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  description?: string;
}

export interface TransferRequest {
  recipientId: number;
  amount: number;
  description?: string;
  recipientName?: string;
}

// Filter interfaces
export interface TransactionFilter {
  type?: TransactionType;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  reference?: string;
}

export interface WalletSummary {
  availableBalance: number;
  pendingAmount: number;
  todayTransactions: number;
  weeklySpending: number;
  monthlySpending: number;
  savingsGoal?: {
    target: number;
    current: number;
    percentage: number;
  };
}

// API Response types
export interface WalletResponse {
  wallet: Wallet;
  summary: WalletSummary;
  recentTransactions: Transaction[];
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    transactionCount: number;
  };
}
