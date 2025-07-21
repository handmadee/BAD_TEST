"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { paymentService } from "@/lib/payment-service";
import { PaymentRequest } from "@/types/payment";

export default function PaymentResultPage() {
    const params = useParams();
    const router = useRouter();
    const paymentId = params.id as string;

    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const request = paymentService.getPaymentRequest(paymentId);

        if (!request) {
            router.push('/wallet');
            return;
        }

        setPaymentRequest(request);
        setLoading(false);
    }, [paymentId, router]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return {
                    icon: '🎉',
                    title: 'Thanh toán thành công!',
                    subtitle: 'Tiền đã được nạp vào ví của bạn',
                    bgColor: 'from-amber-500 to-yellow-600',
                    cardBg: 'bg-amber-50',
                    textColor: 'text-amber-800',
                    borderColor: 'border-amber-200'
                };
            case 'FAILED':
                return {
                    icon: '❌',
                    title: 'Thanh toán thất bại',
                    subtitle: 'Giao dịch không thể hoàn tất',
                    bgColor: 'from-red-500 to-red-600',
                    cardBg: 'bg-red-50',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-200'
                };
            case 'EXPIRED':
                return {
                    icon: '⏰',
                    title: 'Thanh toán đã hết hạn',
                    subtitle: 'Thời gian thanh toán đã vượt quá 10 phút',
                    bgColor: 'from-orange-500 to-orange-600',
                    cardBg: 'bg-orange-50',
                    textColor: 'text-orange-800',
                    borderColor: 'border-orange-200'
                };
            case 'CANCELLED':
                return {
                    icon: '🚫',
                    title: 'Thanh toán đã bị hủy',
                    subtitle: 'Giao dịch đã được hủy bỏ',
                    bgColor: 'from-gray-500 to-gray-600',
                    cardBg: 'bg-gray-50',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-200'
                };
            default:
                return {
                    icon: '⏳',
                    title: 'Đang xử lý...',
                    subtitle: 'Vui lòng chờ trong giây lát',
                    bgColor: 'from-blue-500 to-blue-600',
                    cardBg: 'bg-blue-50',
                    textColor: 'text-blue-800',
                    borderColor: 'border-blue-200'
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải kết quả thanh toán...</p>
                </div>
            </div>
        );
    }

    if (!paymentRequest) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thanh toán</h1>
                    <button
                        onClick={() => router.push('/wallet')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Quay lại ví
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(paymentRequest.status);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />

                <div className="max-w-2xl mx-auto px-4 py-6">
                    {/* Result Header */}
                    <div className={`bg-gradient-to-br ${statusConfig.bgColor} rounded-3xl shadow-2xl p-8 text-white text-center mb-8 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                        <div className="relative">
                            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                                <span className="text-4xl">{statusConfig.icon}</span>
                            </div>
                            <h1 className="text-2xl font-bold mb-2">{statusConfig.title}</h1>
                            <p className="text-lg opacity-90">{statusConfig.subtitle}</p>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className={`bg-white rounded-2xl shadow-lg border-2 ${statusConfig.borderColor} p-6 mb-6`}>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">
                            📋 Chi tiết giao dịch
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Mã giao dịch:</span>
                                <span className="font-mono font-bold text-slate-900">{paymentRequest.id}</span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Số tiền:</span>
                                <span className="font-bold text-2xl text-green-600">
                                    {formatPrice(paymentRequest.amount)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Phương thức:</span>
                                <span className="font-medium text-slate-900">
                                    {paymentRequest.method === 'VIET_QR' ? 'VietQR' : 'Admin Approval'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Thời gian tạo:</span>
                                <span className="font-medium text-slate-900">
                                    {formatDate(paymentRequest.createdAt)}
                                </span>
                            </div>

                            {paymentRequest.completedAt && (
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-slate-600">Thời gian hoàn tất:</span>
                                    <span className="font-medium text-slate-900">
                                        {formatDate(paymentRequest.completedAt)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Trạng thái:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.cardBg} ${statusConfig.textColor}`}>
                                    {paymentRequest.status}
                                </span>
                            </div>

                            {paymentRequest.metadata?.failureReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <span className="text-red-600 text-sm">
                                        <strong>Lý do thất bại:</strong> {paymentRequest.metadata.failureReason}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status-specific Messages */}
                    {paymentRequest.status === 'COMPLETED' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                            <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                                <span className="mr-2">✅</span>
                                Thanh toán thành công
                            </h3>
                            <ul className="text-amber-700 space-y-2 text-sm">
                                <li>• Tiền đã được nạp vào ví của bạn</li>
                                <li>• Bạn có thể sử dụng để thanh toán đặt sân</li>
                                <li>• Lịch sử giao dịch đã được cập nhật</li>
                                <li>• Cảm ơn bạn đã sử dụng dịch vụ!</li>
                            </ul>
                        </div>
                    )}

                    {paymentRequest.status === 'EXPIRED' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
                            <h3 className="font-semibold text-orange-800 mb-3 flex items-center">
                                <span className="mr-2">⏰</span>
                                Thanh toán hết hạn
                            </h3>
                            <ul className="text-orange-700 space-y-2 text-sm">
                                <li>• Thời gian thanh toán đã vượt quá 10 phút</li>
                                <li>• Vui lòng tạo giao dịch mới nếu muốn nạp tiền</li>
                                <li>• Đảm bảo hoàn tất thanh toán trong thời hạn</li>
                            </ul>
                        </div>
                    )}

                    {(paymentRequest.status === 'FAILED' || paymentRequest.status === 'CANCELLED') && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                            <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                                <span className="mr-2">❌</span>
                                Thanh toán không thành công
                            </h3>
                            <ul className="text-red-700 space-y-2 text-sm">
                                <li>• Giao dịch đã bị hủy bỏ hoặc thất bại</li>
                                <li>• Không có tiền nào bị trừ từ tài khoản của bạn</li>
                                <li>• Bạn có thể thử lại với giao dịch mới</li>
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/wallet')}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            💳 Quay lại ví của tôi
                        </button>

                        {(paymentRequest.status === 'FAILED' || paymentRequest.status === 'EXPIRED' || paymentRequest.status === 'CANCELLED') && (
                            <button
                                onClick={() => router.push('/wallet')}
                                className="w-full border-2 border-slate-300 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                🔄 Thử nạp tiền lại
                            </button>
                        )}

                        {paymentRequest.status === 'COMPLETED' && (
                            <button
                                onClick={() => router.push('/courts')}
                                className="w-full border-2 border-amber-300 text-amber-700 font-medium py-3 rounded-xl hover:bg-amber-50 transition-colors"
                            >
                                🏸 Đặt sân ngay
                            </button>
                        )}
                    </div>

                    {/* Payment Tips */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <span className="mr-2">💡</span>
                            Mẹo thanh toán
                        </h3>
                        <ul className="text-blue-700 space-y-2 text-sm">
                            <li>• Luôn kiểm tra thông tin trước khi chuyển khoản</li>
                            <li>• Sử dụng đúng nội dung chuyển khoản để xử lý nhanh</li>
                            <li>• Hoàn tất thanh toán trong vòng 10 phút</li>
                            <li>• Liên hệ hỗ trợ nếu gặp vấn đề: support@badmintonapp.com</li>
                        </ul>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 