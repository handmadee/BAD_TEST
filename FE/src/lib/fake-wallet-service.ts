import {
  Wallet,
  Transaction,
  WalletStats,
  WalletSummary,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  TransactionFilter,
  TopUpRequest,
  WithdrawalRequest,
  TransferRequest,
} from "@/types/wallet";

export class FakeWalletService {
  private static readonly WALLET_KEY = "fake_wallet";
  private static readonly TRANSACTIONS_KEY = "fake_transactions";
  private static readonly STATS_KEY = "fake_wallet_stats";

  /**
   * Khởi tạo ví fake cho user
   */
  static initializeWallet(userId: number): Wallet {
    const wallet: Wallet = {
      id: `wallet_${userId}_${Date.now()}`,
      userId,
      balance: 2500000, // 2.5M VND starting balance for demo
      lockedBalance: 0,
      totalEarned: 2500000,
      totalSpent: 0,
      currency: "VND",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.WALLET_KEY, JSON.stringify(wallet));
    this.createSampleTransactions(userId, wallet.id);
    return wallet;
  }

  /**
   * Lấy ví hiện tại
   */
  static getWallet(): Wallet | null {
    try {
      const walletJson = localStorage.getItem(this.WALLET_KEY);
      return walletJson ? JSON.parse(walletJson) : null;
    } catch (error) {
      console.error("Error loading wallet:", error);
      return null;
    }
  }

  /**
   * Cập nhật ví
   */
  static updateWallet(wallet: Partial<Wallet>): boolean {
    try {
      const currentWallet = this.getWallet();
      if (!currentWallet) return false;

      const updatedWallet = {
        ...currentWallet,
        ...wallet,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(this.WALLET_KEY, JSON.stringify(updatedWallet));
      this.updateStats();
      return true;
    } catch (error) {
      console.error("Error updating wallet:", error);
      return false;
    }
  }

  /**
   * Tạo transaction mới
   */
  static createTransaction(
    type: TransactionType,
    amount: number,
    description: string,
    paymentMethod?: PaymentMethod,
    metadata?: any
  ): Transaction | null {
    try {
      const wallet = this.getWallet();
      if (!wallet) return null;

      const isDebit = this.isDebitTransaction(type);
      const newBalance = isDebit
        ? wallet.balance - amount
        : wallet.balance + amount;

      // Validate sufficient balance for debit transactions
      if (isDebit && newBalance < 0) {
        throw new Error("Insufficient balance");
      }

      const transaction: Transaction = {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: wallet.userId,
        type,
        status: "COMPLETED",
        amount,
        balance: newBalance,
        description,
        paymentMethod,
        metadata,
        createdAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      };

      // Update wallet balance
      this.updateWallet({
        balance: newBalance,
        totalSpent: isDebit ? wallet.totalSpent + amount : wallet.totalSpent,
        totalEarned: isDebit ? wallet.totalEarned : wallet.totalEarned + amount,
        lastTransactionAt: new Date().toISOString(),
      });

      // Save transaction
      const transactions = this.getAllTransactions();
      transactions.unshift(transaction); // Add to beginning for newest first
      localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));

      this.updateStats();
      return transaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      return null;
    }
  }

  /**
   * Lấy tất cả transactions
   */
  static getAllTransactions(): Transaction[] {
    try {
      const transactionsJson = localStorage.getItem(this.TRANSACTIONS_KEY);
      return transactionsJson ? JSON.parse(transactionsJson) : [];
    } catch (error) {
      console.error("Error loading transactions:", error);
      return [];
    }
  }

  /**
   * Lấy transactions với filter
   */
  static getFilteredTransactions(
    filter: TransactionFilter = {}
  ): Transaction[] {
    let transactions = this.getAllTransactions();

    if (filter.type) {
      transactions = transactions.filter((t) => t.type === filter.type);
    }

    if (filter.status) {
      transactions = transactions.filter((t) => t.status === filter.status);
    }

    if (filter.paymentMethod) {
      transactions = transactions.filter(
        (t) => t.paymentMethod === filter.paymentMethod
      );
    }

    if (filter.startDate) {
      transactions = transactions.filter(
        (t) => t.createdAt >= filter.startDate!
      );
    }

    if (filter.endDate) {
      transactions = transactions.filter((t) => t.createdAt <= filter.endDate!);
    }

    if (filter.minAmount) {
      transactions = transactions.filter((t) => t.amount >= filter.minAmount!);
    }

    if (filter.maxAmount) {
      transactions = transactions.filter((t) => t.amount <= filter.maxAmount!);
    }

    if (filter.reference) {
      transactions = transactions.filter(
        (t) =>
          t.reference?.includes(filter.reference!) ||
          t.description.toLowerCase().includes(filter.reference!.toLowerCase())
      );
    }

    return transactions;
  }

  /**
   * Nạp tiền
   */
  static topUp(request: TopUpRequest): Transaction | null {
    return this.createTransaction(
      "TOP_UP",
      request.amount,
      request.description || `Nạp tiền qua ${request.paymentMethod}`,
      request.paymentMethod,
      { topUpMethod: request.paymentMethod }
    );
  }

  /**
   * Rút tiền
   */
  static withdraw(request: WithdrawalRequest): Transaction | null {
    return this.createTransaction(
      "WITHDRAWAL",
      request.amount,
      request.description || `Rút tiền về ${request.bankName}`,
      "BANKING",
      {
        bankAccount: request.bankAccount,
        bankName: request.bankName,
        accountHolder: request.accountHolder,
      }
    );
  }

  /**
   * Chuyển tiền
   */
  static transfer(request: TransferRequest): Transaction | null {
    return this.createTransaction(
      "TRANSFER_OUT",
      request.amount,
      request.description || `Chuyển tiền cho ${request.recipientName}`,
      "WALLET",
      {
        recipientId: request.recipientId,
        recipientName: request.recipientName,
      }
    );
  }

  /**
   * Thanh toán booking
   */
  static payForBooking(
    amount: number,
    bookingId: number,
    courtName: string
  ): Transaction | null {
    return this.createTransaction(
      "BOOKING_PAYMENT",
      amount,
      `Thanh toán đặt sân ${courtName}`,
      "WALLET",
      {
        bookingId,
        courtName,
      }
    );
  }

  /**
   * Lấy summary
   */
  static getWalletSummary(): WalletSummary {
    const wallet = this.getWallet();
    const transactions = this.getAllTransactions();

    if (!wallet) {
      return {
        availableBalance: 0,
        pendingAmount: 0,
        todayTransactions: 0,
        weeklySpending: 0,
        monthlySpending: 0,
      };
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayTransactions = transactions.filter((t) =>
      t.createdAt.startsWith(todayStr)
    ).length;

    const weeklySpending = transactions
      .filter(
        (t) =>
          new Date(t.createdAt) >= weekAgo && this.isDebitTransaction(t.type)
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlySpending = transactions
      .filter(
        (t) =>
          new Date(t.createdAt) >= monthAgo && this.isDebitTransaction(t.type)
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      availableBalance: wallet.balance,
      pendingAmount: wallet.lockedBalance,
      todayTransactions,
      weeklySpending,
      monthlySpending,
      savingsGoal: {
        target: 10000000, // 10M VND goal
        current: wallet.balance,
        percentage: Math.min((wallet.balance / 10000000) * 100, 100),
      },
    };
  }

  /**
   * Lấy thống kê
   */
  static getStats(): WalletStats {
    const transactions = this.getAllTransactions();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });

    const totalIncome = transactions
      .filter((t) => !this.isDebitTransaction(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => this.isDebitTransaction(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthIncome = thisMonthTransactions
      .filter((t) => !this.isDebitTransaction(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpense = thisMonthTransactions
      .filter((t) => this.isDebitTransaction(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    // Count transactions by type
    const transactionsByType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {} as Record<TransactionType, number>);

    // Find favorite payment method
    const paymentMethodCounts = transactions
      .filter((t) => t.paymentMethod)
      .reduce((acc, t) => {
        acc[t.paymentMethod!] = (acc[t.paymentMethod!] || 0) + 1;
        return acc;
      }, {} as Record<PaymentMethod, number>);

    const favoritePaymentMethod =
      (Object.entries(paymentMethodCounts).sort(
        ([, a], [, b]) => b - a
      )[0]?.[0] as PaymentMethod) || null;

    // Generate monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.createdAt);
        return (
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear()
        );
      });

      monthlyTrend.push({
        month: date.toLocaleDateString("vi-VN", {
          month: "short",
          year: "numeric",
        }),
        income: monthTransactions
          .filter((t) => !this.isDebitTransaction(t.type))
          .reduce((sum, t) => sum + t.amount, 0),
        expense: monthTransactions
          .filter((t) => this.isDebitTransaction(t.type))
          .reduce((sum, t) => sum + t.amount, 0),
        transactions: monthTransactions.length,
      });
    }

    return {
      totalTransactions: transactions.length,
      thisMonthTransactions: thisMonthTransactions.length,
      totalIncome,
      totalExpense,
      thisMonthIncome,
      thisMonthExpense,
      averageTransaction: transactions.length
        ? transactions.reduce((sum, t) => sum + t.amount, 0) /
          transactions.length
        : 0,
      largestTransaction: Math.max(...transactions.map((t) => t.amount), 0),
      favoritePaymentMethod,
      transactionsByType,
      monthlyTrend,
    };
  }

  /**
   * Kiểm tra transaction có phải là debit không
   */
  private static isDebitTransaction(type: TransactionType): boolean {
    return [
      "BOOKING_PAYMENT",
      "WITHDRAWAL",
      "PENALTY",
      "TRANSFER_OUT",
    ].includes(type);
  }

  /**
   * Tạo sample transactions
   */
  private static createSampleTransactions(
    userId: number,
    walletId: string
  ): void {
    const sampleTransactions: Partial<Transaction>[] = [
      {
        userId,
        type: "TOP_UP",
        status: "COMPLETED",
        amount: 2000000,
        balance: 2000000,
        description: "Nạp tiền lần đầu",
        paymentMethod: "MOMO",
        createdAt: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        userId,
        type: "BOOKING_PAYMENT",
        status: "COMPLETED",
        amount: 150000,
        balance: 1850000,
        description: "Thanh toán đặt sân Cầu lông Đà Nẵng",
        paymentMethod: "WALLET",
        metadata: { bookingId: 12345, courtName: "Sân Cầu Lông Đà Nẵng" },
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId,
        type: "BONUS",
        status: "COMPLETED",
        amount: 50000,
        balance: 1900000,
        description: "Thưởng đăng ký thành viên mới",
        paymentMethod: "WALLET",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId,
        type: "TOP_UP",
        status: "COMPLETED",
        amount: 500000,
        balance: 2400000,
        description: "Nạp tiền qua ZaloPay",
        paymentMethod: "ZALOPAY",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId,
        type: "CASHBACK",
        status: "COMPLETED",
        amount: 15000,
        balance: 2415000,
        description: "Hoàn tiền 10% thanh toán đặt sân",
        paymentMethod: "WALLET",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId,
        type: "BOOKING_PAYMENT",
        status: "COMPLETED",
        amount: 200000,
        balance: 2215000,
        description: "Thanh toán đặt sân VIP",
        paymentMethod: "WALLET",
        metadata: { bookingId: 12346, courtName: "Sân VIP Center" },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        userId,
        type: "TOP_UP",
        status: "COMPLETED",
        amount: 300000,
        balance: 2515000,
        description: "Nạp tiền qua chuyển khoản",
        paymentMethod: "BANKING",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const transactions = sampleTransactions.map((t) => ({
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...t,
      processedAt: t.createdAt,
    })) as Transaction[];

    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(transactions));
  }

  /**
   * Cập nhật thống kê
   */
  private static updateStats(): void {
    const stats = this.getStats();
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  /**
   * Xóa tất cả dữ liệu
   */
  static clearAll(): void {
    localStorage.removeItem(this.WALLET_KEY);
    localStorage.removeItem(this.TRANSACTIONS_KEY);
    localStorage.removeItem(this.STATS_KEY);
  }

  /**
   * Kiểm tra có ví hay chưa
   */
  static hasWallet(): boolean {
    return this.getWallet() !== null;
  }
}

// Export singleton
export const fakeWalletService = FakeWalletService;
