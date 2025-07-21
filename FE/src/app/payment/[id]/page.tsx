"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { paymentService } from "@/lib/payment-service";
import { fakeWalletService } from "@/lib/fake-wallet-service";
import { PaymentRequest, PAYMENT_CONFIG } from "@/types/payment";
import { authService } from "@/lib";

export default function PaymentProcessingPage() {
    const params = useParams();
    const router = useRouter();
    const paymentId = params.id as string;

    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [isExpired, setIsExpired] = useState(false);
    const [hotkeyPressed, setHotkeyPressed] = useState(false);

    const loadPaymentData = useCallback(() => {
        const request = paymentService.getPaymentRequest(paymentId);

        if (!request) {
            router.push('/wallet');
            return;
        }

        setPaymentRequest(request);

        // Check if already completed or failed
        if (['COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED'].includes(request.status)) {
            router.push(`/payment/result/${request.id}`);
            return;
        }

        // Use the provided VietQR image
        if (request.method === 'VIET_QR') {
            setQrCodeUrl('/vietQR.gif'); // Use the actual VietQR image
        }

        // Calculate time remaining
        const remaining = paymentService.getTimeRemaining(request);
        setTimeRemaining(remaining);
        setIsExpired(remaining <= 0);

        setLoading(false);
    }, [paymentId, router]);

    // Countdown timer
    useEffect(() => {
        if (!paymentRequest || isExpired) return;

        const interval = setInterval(() => {
            const remaining = paymentService.getTimeRemaining(paymentRequest);
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                setIsExpired(true);
                paymentService.updatePaymentStatus(paymentId, 'EXPIRED', {
                    failureReason: 'Payment timeout'
                });
                clearInterval(interval);

                // Redirect to failed page after 3 seconds
                setTimeout(() => {
                    router.push(`/payment/result/${paymentId}`);
                }, 3000);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [paymentRequest, paymentId, router, isExpired]);

    const handleCompletePayment = useCallback(async () => {
        if (!paymentRequest || isExpired || processing) return;

        setProcessing(true);

        // Simulate processing delay
        setTimeout(() => {
            const success = paymentService.completePayment(paymentId);

            if (success) {
                // Add money to wallet if it's a top-up
                if (paymentRequest.type === 'TOP_UP') {
                    fakeWalletService.topUp({
                        amount: paymentRequest.amount,
                        paymentMethod: paymentRequest.method === 'VIET_QR' ? 'BANKING' : 'BANKING',
                        description: `Nạp tiền qua ${paymentRequest.method}`
                    });
                }

                router.push(`/payment/result/${paymentId}`);
            } else {
                setProcessing(false);
                alert('❌ Không thể hoàn tất thanh toán. Vui lòng thử lại.');
            }
        }, 2000);
    }, [paymentRequest, isExpired, processing, paymentId, router]);

    // Hotkey handler for M key (for demo purposes)
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            console.log('Key pressed:', event.code, 'Expected:', PAYMENT_CONFIG.HOTKEY_COMPLETE);
            if (event.code === PAYMENT_CONFIG.HOTKEY_COMPLETE && !isExpired && !processing && paymentRequest) {
                console.log('Processing payment via hotkey');
                event.preventDefault();
                setHotkeyPressed(true);
                setTimeout(() => setHotkeyPressed(false), 2000);
                handleCompletePayment();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isExpired, processing, paymentRequest, handleCompletePayment]);

    // Load payment data on mount
    useEffect(() => {
        loadPaymentData();
    }, [loadPaymentData]);

    const handleCancelPayment = () => {
        if (confirm('Bạn có chắc muốn hủy thanh toán này?')) {
            paymentService.cancelPayment(paymentId, 'Cancelled by user');
            router.push('/wallet');
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />

                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-amber-800 mb-2">
                            💳 Thanh toán
                        </h1>
                        <p className="text-slate-600">
                            Hoàn tất thanh toán để nạp tiền vào ví
                        </p>
                        {hotkeyPressed && (
                            <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg animate-pulse">
                                <p className="text-amber-800 font-medium">🎯 Phím tắt được kích hoạt!</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side - Timer & Instructions */}
                        <div className="space-y-6">
                            {/* Timer Card */}
                            <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${isExpired ? 'border-red-200 bg-red-50' :
                                timeRemaining <= 120 ? 'border-orange-200 bg-orange-50' :
                                    'border-green-200 bg-green-50'
                                }`}>
                                <div className="text-center">
                                    <div className={`text-6xl font-bold mb-4 ${isExpired ? 'text-red-600' :
                                        timeRemaining <= 120 ? 'text-orange-600' :
                                            'text-green-600'
                                        }`}>
                                        {isExpired ? '00:00' : formatTime(timeRemaining)}
                                    </div>
                                    <p className={`text-lg font-medium ${isExpired ? 'text-red-700' :
                                        timeRemaining <= 120 ? 'text-orange-700' :
                                            'text-green-700'
                                        }`}>
                                        {isExpired ? 'Đã hết hạn' : 'Thời gian còn lại'}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    📋 Thông tin thanh toán
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Mã giao dịch:</span>
                                        <span className="font-mono font-medium">{paymentRequest.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Số tiền:</span>
                                        <span className="font-bold text-green-600">
                                            {formatPrice(paymentRequest.amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Phương thức:</span>
                                        <span className="font-medium">
                                            {paymentRequest.method === 'VIET_QR' ? 'VietQR' : 'Admin Approval'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Mô tả:</span>
                                        <span className="font-medium">{paymentRequest.description}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    📝 Hướng dẫn thanh toán
                                </h3>
                                {paymentRequest.method === 'VIET_QR' ? (
                                    <div className="space-y-3 text-slate-700">
                                        <p>1. Mở ứng dụng ngân hàng của bạn</p>
                                        <p>2. Quét mã QR bên phải</p>
                                        <p>3. Kiểm tra thông tin và xác nhận chuyển khoản</p>
                                        <p>4. Hệ thống sẽ tự động cập nhật khi nhận được tiền</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 text-slate-700">
                                        <p>1. Chuyển khoản theo thông tin bên phải</p>
                                        <p>2. Chờ admin xác nhận (1-5 phút)</p>
                                        <p>3. Hệ thống sẽ tự động cập nhật</p>
                                    </div>
                                )}

                                {!isExpired && (
                                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                        <p className="text-amber-800 text-sm font-medium">
                                            ⚠️ <strong>Quan trọng:</strong> Vui lòng chuyển khoản đúng số tiền và nội dung để được xử lý tự động
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - QR Code / Bank Info */}
                        <div className="space-y-6">
                            {paymentRequest.method === 'VIET_QR' && qrCodeUrl && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
                                        📱 Quét mã QR để thanh toán
                                    </h3>
                                    <div className="flex justify-center mb-4">
                                        <div className="p-2 bg-white border-2 border-slate-200 rounded-xl shadow-lg">
                                            <img
                                                src={qrCodeUrl}
                                                alt="VietQR Payment Code"
                                                className="w-full max-w-sm h-auto"
                                                style={{ maxHeight: '400px' }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-center text-slate-600 text-sm">
                                        Quét mã QR bằng ứng dụng ngân hàng hoặc chuyển khoản thủ công
                                    </p>
                                </div>
                            )}

                            {/* Bank Account Info */}
                            {paymentRequest.bankAccount && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                        🏦 Thông tin chuyển khoản
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <label className="text-sm text-slate-600">Ngân hàng</label>
                                            <p className="font-bold text-slate-900">{paymentRequest.bankAccount.bankName}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <label className="text-sm text-slate-600">Số tài khoản</label>
                                            <p className="font-mono font-bold text-slate-900 text-lg">
                                                {paymentRequest.bankAccount.accountNumber}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <label className="text-sm text-slate-600">Chủ tài khoản</label>
                                            <p className="font-bold text-slate-900">{paymentRequest.bankAccount.accountName}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <label className="text-sm text-slate-600">Số tiền</label>
                                            <p className="font-bold text-green-600 text-xl">
                                                {formatPrice(paymentRequest.amount)}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <label className="text-sm text-slate-600">Nội dung chuyển khoản</label>
                                            <p className="font-mono font-bold text-slate-900">{paymentRequest.bankAccount.content}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {!isExpired && !processing && (
                                    <button
                                        onClick={handleCompletePayment}
                                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        ✅ Xác nhận đã chuyển khoản
                                    </button>
                                )}

                                {processing && (
                                    <div className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Đang xử lý...
                                    </div>
                                )}

                                {isExpired && (
                                    <div className="w-full bg-red-500 text-white font-bold py-4 rounded-xl text-center">
                                        ❌ Đã hết hạn thanh toán
                                    </div>
                                )}

                                <button
                                    onClick={handleCancelPayment}
                                    disabled={processing}
                                    className="w-full border-2 border-slate-300 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    Hủy thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 