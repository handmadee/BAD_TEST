import React from 'react';
import { Booking } from '@/types/api';

interface BookingSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    onViewBookings: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
    isOpen,
    onClose,
    booking,
    onViewBookings
}) => {
    if (!isOpen || !booking) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
                {/* Success Animation Header */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20"></div>
                    <div className="relative">
                        <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center animate-bounce">
                            <svg
                                className="w-10 h-10 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            🎉 Đặt sân thành công!
                        </h2>
                        <p className="text-green-100">
                            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
                        </p>
                    </div>
                </div>

                {/* Booking Details */}
                <div className="p-6">
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 mb-6">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                                📋
                            </span>
                            Chi tiết đặt sân
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Mã đặt sân:</span>
                                <span className="font-mono font-bold text-slate-900">
                                    #{booking.id}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Sân:</span>
                                <span className="font-medium text-slate-900">
                                    {booking.court.name}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Ngày:</span>
                                <span className="font-medium text-slate-900">
                                    {formatDate(booking.bookingDate)}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-600">Thời gian:</span>
                                <span className="font-medium text-slate-900">
                                    {booking.startTime} - {booking.endTime}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                <span className="text-slate-800 font-medium">Tổng tiền:</span>
                                <span className="text-green-600 font-bold text-xl">
                                    {formatPrice(booking.totalPrice)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            Đã xác nhận
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                        <h4 className="font-medium text-amber-800 mb-2 flex items-center">
                            <span className="mr-2">💡</span>
                            Lưu ý quan trọng
                        </h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                            <li>• Vui lòng đến sân đúng giờ đã đặt</li>
                            <li>• Mang theo giày thể thao và đồ chơi cầu lông</li>
                            <li>• Liên hệ {booking.court.phone} nếu cần hỗ trợ</li>
                            <li>• Hủy sân trước 2 giờ để được hoàn tiền</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            onClick={() => {
                                onViewBookings();
                                onClose();
                            }}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                        >
                            Xem đặt sân của tôi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 