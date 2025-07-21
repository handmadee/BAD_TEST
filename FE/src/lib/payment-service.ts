import {
  PaymentRequest,
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  QRPaymentData,
  DEMO_BANK_ACCOUNTS,
  PAYMENT_CONFIG,
} from "@/types/payment";

export class PaymentService {
  private static readonly STORAGE_KEY = "payment_requests";
  private static readonly ACTIVE_PAYMENT_KEY = "active_payment";

  /**
   * Tạo payment request mới
   */
  static createPaymentRequest(
    userId: number,
    type: PaymentType,
    method: PaymentMethod,
    amount: number,
    description: string
  ): PaymentRequest {
    const paymentId = `pay_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + PAYMENT_CONFIG.TIMEOUT_MINUTES * 60 * 1000
    );

    const request: PaymentRequest = {
      id: paymentId,
      userId,
      type,
      method,
      amount,
      description,
      status: "PENDING",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Generate QR code data for VietQR
    if (method === "VIET_QR") {
      const bankAccount = DEMO_BANK_ACCOUNTS.VIETCOMBANK;
      const content = `${paymentId} NAP TIEN BADMINTON`;

      request.qrCode = this.generateQRString(
        bankAccount.accountNumber,
        amount,
        content
      );
      request.qrText = content;
      request.bankAccount = {
        accountNumber: bankAccount.accountNumber,
        accountName: bankAccount.accountName,
        bankName: bankAccount.bankName,
        content,
      };
    }

    // Save to storage
    this.savePaymentRequest(request);
    this.setActivePayment(paymentId);

    return request;
  }

  /**
   * Generate QR string for VietQR (simplified version)
   */
  private static generateQRString(
    accountNumber: string,
    amount: number,
    content: string
  ): string {
    // Simplified QR generation - in real app would use proper QR library
    const qrData = {
      bankCode: "VCB",
      accountNumber,
      amount,
      content,
      template: "compact",
    };
    return btoa(JSON.stringify(qrData));
  }

  /**
   * Generate QR code URL (using external service for demo)
   */
  static getQRCodeUrl(qrString: string, size: number = 300): string {
    // Using QR server.com for demo - in production use your own QR service
    const qrContent = encodeURIComponent(qrString);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${qrContent}`;
  }

  /**
   * Lưu payment request
   */
  private static savePaymentRequest(request: PaymentRequest): void {
    try {
      const requests = this.getAllPaymentRequests();
      const existingIndex = requests.findIndex((r) => r.id === request.id);

      if (existingIndex >= 0) {
        requests[existingIndex] = request;
      } else {
        requests.push(request);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error("Error saving payment request:", error);
    }
  }

  /**
   * Lấy tất cả payment requests
   */
  static getAllPaymentRequests(): PaymentRequest[] {
    try {
      const requestsJson = localStorage.getItem(this.STORAGE_KEY);
      return requestsJson ? JSON.parse(requestsJson) : [];
    } catch (error) {
      console.error("Error loading payment requests:", error);
      return [];
    }
  }

  /**
   * Lấy payment request theo ID
   */
  static getPaymentRequest(paymentId: string): PaymentRequest | null {
    const requests = this.getAllPaymentRequests();
    return requests.find((r) => r.id === paymentId) || null;
  }

  /**
   * Cập nhật payment status
   */
  static updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    metadata?: any
  ): boolean {
    try {
      const request = this.getPaymentRequest(paymentId);
      if (!request) return false;

      request.status = status;
      request.metadata = { ...request.metadata, ...metadata };

      if (status === "PROCESSING") {
        request.processingStartedAt = new Date().toISOString();
      } else if (
        status === "COMPLETED" ||
        status === "FAILED" ||
        status === "EXPIRED"
      ) {
        request.completedAt = new Date().toISOString();
        this.clearActivePayment();
      }

      this.savePaymentRequest(request);
      return true;
    } catch (error) {
      console.error("Error updating payment status:", error);
      return false;
    }
  }

  /**
   * Complete payment (when user presses M)
   */
  static completePayment(paymentId: string): boolean {
    const request = this.getPaymentRequest(paymentId);
    if (!request) return false;

    // Check if payment is still valid
    if (this.isPaymentExpired(request)) {
      this.updatePaymentStatus(paymentId, "EXPIRED", {
        failureReason: "Payment expired",
      });
      return false;
    }

    // Complete payment
    return this.updatePaymentStatus(paymentId, "COMPLETED", {
      completedBy: "user_hotkey",
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Kiểm tra payment có hết hạn không
   */
  static isPaymentExpired(request: PaymentRequest): boolean {
    return new Date() > new Date(request.expiresAt);
  }

  /**
   * Tính thời gian còn lại (seconds)
   */
  static getTimeRemaining(request: PaymentRequest): number {
    const now = new Date().getTime();
    const expires = new Date(request.expiresAt).getTime();
    return Math.max(0, Math.floor((expires - now) / 1000));
  }

  /**
   * Set active payment
   */
  static setActivePayment(paymentId: string): void {
    localStorage.setItem(this.ACTIVE_PAYMENT_KEY, paymentId);
  }

  /**
   * Get active payment
   */
  static getActivePayment(): PaymentRequest | null {
    try {
      const paymentId = localStorage.getItem(this.ACTIVE_PAYMENT_KEY);
      if (!paymentId) return null;

      const request = this.getPaymentRequest(paymentId);
      if (!request) {
        this.clearActivePayment();
        return null;
      }

      // Check if expired
      if (this.isPaymentExpired(request) && request.status === "PENDING") {
        this.updatePaymentStatus(paymentId, "EXPIRED");
        return request;
      }

      return request;
    } catch (error) {
      console.error("Error getting active payment:", error);
      return null;
    }
  }

  /**
   * Clear active payment
   */
  static clearActivePayment(): void {
    localStorage.removeItem(this.ACTIVE_PAYMENT_KEY);
  }

  /**
   * Cancel payment
   */
  static cancelPayment(paymentId: string, reason?: string): boolean {
    return this.updatePaymentStatus(paymentId, "CANCELLED", {
      failureReason: reason || "Cancelled by user",
    });
  }

  /**
   * Cleanup expired payments
   */
  static cleanupExpiredPayments(): void {
    const requests = this.getAllPaymentRequests();
    let hasChanges = false;

    requests.forEach((request) => {
      if (request.status === "PENDING" && this.isPaymentExpired(request)) {
        this.updatePaymentStatus(request.id, "EXPIRED");
        hasChanges = true;
      }
    });

    if (hasChanges) {
      console.log("Cleaned up expired payments");
    }
  }

  /**
   * Get payment statistics
   */
  static getPaymentStats() {
    const requests = this.getAllPaymentRequests();

    return {
      total: requests.length,
      completed: requests.filter((r) => r.status === "COMPLETED").length,
      failed: requests.filter((r) => r.status === "FAILED").length,
      expired: requests.filter((r) => r.status === "EXPIRED").length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      totalAmount: requests
        .filter((r) => r.status === "COMPLETED")
        .reduce((sum, r) => sum + r.amount, 0),
    };
  }

  /**
   * Clear all payment data (for testing)
   */
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.ACTIVE_PAYMENT_KEY);
  }
}

// Export singleton
export const paymentService = PaymentService;
