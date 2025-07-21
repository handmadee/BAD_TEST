import { Booking, Court, User } from "@/types/api";

export interface FakeBookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  thisMonthBookings: number;
}

export class FakeBookingService {
  private static readonly STORAGE_KEY = "fake_bookings";
  private static readonly STATS_KEY = "fake_booking_stats";

  /**
   * Lưu một booking mới vào localStorage
   */
  static saveBooking(booking: Booking): void {
    try {
      const existingBookings = this.getAllBookings();
      existingBookings.push(booking);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingBookings));
      this.updateStats();
    } catch (error) {
      console.error("Error saving booking to localStorage:", error);
    }
  }

  /**
   * Lấy tất cả bookings từ localStorage
   */
  static getAllBookings(): Booking[] {
    try {
      const bookingsJson = localStorage.getItem(this.STORAGE_KEY);
      return bookingsJson ? JSON.parse(bookingsJson) : [];
    } catch (error) {
      console.error("Error loading bookings from localStorage:", error);
      return [];
    }
  }

  /**
   * Lấy booking theo ID
   */
  static getBookingById(id: number): Booking | null {
    const bookings = this.getAllBookings();
    return bookings.find((booking) => booking.id === id) || null;
  }

  /**
   * Cập nhật trạng thái booking
   */
  static updateBookingStatus(id: number, status: Booking["status"]): boolean {
    try {
      const bookings = this.getAllBookings();
      const bookingIndex = bookings.findIndex((booking) => booking.id === id);

      if (bookingIndex !== -1) {
        bookings[bookingIndex].status = status;
        bookings[bookingIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
        this.updateStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating booking status:", error);
      return false;
    }
  }

  /**
   * Hủy booking
   */
  static cancelBooking(id: number, reason?: string): boolean {
    return this.updateBookingStatus(id, "CANCELLED");
  }

  /**
   * Lấy bookings theo bộ lọc
   */
  static getFilteredBookings(filters: {
    status?: Booking["status"];
    startDate?: string;
    endDate?: string;
    courtId?: number;
  }): Booking[] {
    let bookings = this.getAllBookings();

    if (filters.status) {
      bookings = bookings.filter(
        (booking) => booking.status === filters.status
      );
    }

    if (filters.startDate) {
      bookings = bookings.filter(
        (booking) => booking.bookingDate >= filters.startDate!
      );
    }

    if (filters.endDate) {
      bookings = bookings.filter(
        (booking) => booking.bookingDate <= filters.endDate!
      );
    }

    if (filters.courtId) {
      bookings = bookings.filter(
        (booking) => booking.court.id === filters.courtId
      );
    }

    return bookings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Lấy bookings theo user
   */
  static getUserBookings(userId: number): Booking[] {
    return this.getAllBookings().filter(
      (booking) => booking.user.id === userId
    );
  }

  /**
   * Tạo booking ID duy nhất
   */
  static generateBookingId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Cập nhật thống kê
   */
  private static updateStats(): void {
    try {
      const bookings = this.getAllBookings();
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const stats: FakeBookingStats = {
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter((b) => b.status === "CONFIRMED")
          .length,
        pendingBookings: bookings.filter((b) => b.status === "PENDING").length,
        totalRevenue: bookings
          .filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED")
          .reduce((sum, b) => sum + b.totalPrice, 0),
        thisMonthBookings: bookings.filter((b) => {
          const bookingDate = new Date(b.createdAt);
          return (
            bookingDate.getMonth() === thisMonth &&
            bookingDate.getFullYear() === thisYear
          );
        }).length,
      };

      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error("Error updating booking stats:", error);
    }
  }

  /**
   * Lấy thống kê booking
   */
  static getStats(): FakeBookingStats {
    try {
      const statsJson = localStorage.getItem(this.STATS_KEY);
      if (statsJson) {
        return JSON.parse(statsJson);
      }
      // Nếu chưa có stats, tính toán lại
      this.updateStats();
      return this.getStats();
    } catch (error) {
      console.error("Error loading booking stats:", error);
      return {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
        thisMonthBookings: 0,
      };
    }
  }

  /**
   * Xóa tất cả fake bookings (để testing)
   */
  static clearAllBookings(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STATS_KEY);
  }

  /**
   * Tạo sample bookings để demo
   */
  static createSampleBookings(courts: Court[], user: User): void {
    const sampleBookings: Partial<Booking>[] = [
      {
        court: courts[0],
        user: user,
        bookingDate: "2024-01-20",
        startTime: "14:00",
        endTime: "16:00",
        totalPrice: 300000,
        status: "CONFIRMED",
        notes: "Đặt sân cho 4 người",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 ngày trước
      },
      {
        court: courts[1] || courts[0],
        user: user,
        bookingDate: "2024-01-22",
        startTime: "18:00",
        endTime: "20:00",
        totalPrice: 400000,
        status: "PENDING",
        notes: "Booking cho team công ty",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 ngày trước
      },
      {
        court: courts[2] || courts[0],
        user: user,
        bookingDate: "2024-01-25",
        startTime: "07:00",
        endTime: "08:00",
        totalPrice: 150000,
        status: "COMPLETED",
        notes: "Chơi buổi sáng",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 ngày trước
      },
    ];

    sampleBookings.forEach((booking) => {
      const fullBooking: Booking = {
        ...(booking as Booking),
        id: this.generateBookingId(),
      };
      this.saveBooking(fullBooking);
    });
  }

  /**
   * Kiểm tra xem có booking nào trong localStorage không
   */
  static hasBookings(): boolean {
    return this.getAllBookings().length > 0;
  }
}

// Export singleton instance để sử dụng
export const fakeBookingService = FakeBookingService;
