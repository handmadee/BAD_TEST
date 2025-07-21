import React, { useEffect, useState } from 'react';
import { fakeBookingService, FakeBookingStats } from '@/lib/fake-booking-service';

export const BookingStatsCard: React.FC = () => {
    const [stats, setStats] = useState<FakeBookingStats | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        const bookingStats = fakeBookingService.getStats();
        setStats(bookingStats);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (!stats || stats.totalBookings === 0) {
        return (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600">📊</span>
                    </div>
                    Thống kê đặt sân
                </h3>
                <p className="text-slate-600 text-center py-8">
                    Chưa có booking nào. Hãy đặt sân đầu tiên của bạn!
                </p>
            </div>
        );
    }

    const statItems = [
        {
            label: "Tổng đặt sân",
            value: stats.totalBookings.toString(),
            icon: "🏸",
            color: "blue"
        },
        {
            label: "Đã xác nhận",
            value: stats.confirmedBookings.toString(),
            icon: "✅",
            color: "green"
        },
        {
            label: "Chờ xác nhận",
            value: stats.pendingBookings.toString(),
            icon: "⏳",
            color: "yellow"
        },
        {
            label: "Tổng chi tiêu",
            value: formatPrice(stats.totalRevenue),
            icon: "💰",
            color: "purple"
        }
    ];

    const getColorClasses = (color: string) => {
        const colorMap = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            yellow: "bg-yellow-100 text-yellow-600",
            purple: "bg-purple-100 text-purple-600"
        };
        return colorMap[color as keyof typeof colorMap] || "bg-gray-100 text-gray-600";
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-blue-600">📊</span>
                </div>
                Thống kê đặt sân của bạn
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {statItems.map((item, index) => (
                    <div
                        key={index}
                        className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getColorClasses(item.color)}`}>
                                <span>{item.icon}</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide">
                                    {item.label}
                                </p>
                                <p className="text-lg font-bold text-slate-900">
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {stats.thisMonthBookings > 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800">
                        🎯 <span className="font-medium">Tháng này:</span> Bạn đã đặt {stats.thisMonthBookings} lần
                    </p>
                </div>
            )}

            <button
                onClick={loadStats}
                className="w-full mt-4 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
                🔄 Cập nhật thống kê
            </button>
        </div>
    );
}; 