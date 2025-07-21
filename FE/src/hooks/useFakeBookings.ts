import { useState, useEffect } from "react";
import { Booking } from "@/types/api";
import {
  fakeBookingService,
  FakeBookingStats,
} from "@/lib/fake-booking-service";

export interface UseFakeBookingsReturn {
  bookings: Booking[];
  stats: FakeBookingStats;
  loading: boolean;
  refresh: () => void;
  updateBookingStatus: (id: number, status: Booking["status"]) => boolean;
  cancelBooking: (id: number, reason?: string) => boolean;
  getFilteredBookings: (filters: {
    status?: Booking["status"];
    startDate?: string;
    endDate?: string;
    courtId?: number;
  }) => Booking[];
  hasBookings: boolean;
}

export const useFakeBookings = (): UseFakeBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<FakeBookingStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    thisMonthBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    try {
      const allBookings = fakeBookingService.getAllBookings();
      const bookingStats = fakeBookingService.getStats();

      setBookings(allBookings);
      setStats(bookingStats);
    } catch (error) {
      console.error("Error loading fake bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = () => {
    loadData();
  };

  const updateBookingStatus = (
    id: number,
    status: Booking["status"]
  ): boolean => {
    const success = fakeBookingService.updateBookingStatus(id, status);
    if (success) {
      refresh();
    }
    return success;
  };

  const cancelBooking = (id: number, reason?: string): boolean => {
    const success = fakeBookingService.cancelBooking(id, reason);
    if (success) {
      refresh();
    }
    return success;
  };

  const getFilteredBookings = (filters: {
    status?: Booking["status"];
    startDate?: string;
    endDate?: string;
    courtId?: number;
  }): Booking[] => {
    return fakeBookingService.getFilteredBookings(filters);
  };

  const hasBookings = fakeBookingService.hasBookings();

  return {
    bookings,
    stats,
    loading,
    refresh,
    updateBookingStatus,
    cancelBooking,
    getFilteredBookings,
    hasBookings,
  };
};

export default useFakeBookings;
