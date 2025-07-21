"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { paymentService } from "@/lib/payment-service";
import { fakeWalletService } from "@/lib/fake-wallet-service";
import { PaymentRequest, PaymentStatus } from "@/types/payment";
import { authService } from "@/lib";

export default function AdminPaymentsPage() {
    const router = useRouter();
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [stats, setStats] = useState({
        pending: 0,
        completed: 0,
        failed: 0,
        totalAmount: 0
    });

    useEffect(() => {
        checkAdminAccess();
        loadPayments();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const userResponse = await authService.getCurrentUser();
            if (!userResponse.success || userResponse.data.role !== 'ADMIN') {
                router.push('/unauthorized');
                return;
            }
        } catch (error) {
            router.push('/auth/signin');
        }
    };

    const loadPayments = () => {
        const allPayments = paymentService.getAllPaymentRequests();
        const adminPayments = allPayments.filter(p => p.method === 'ADMIN_APPROVAL');

        setPayments(adminPayments.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));

        // Calculate stats
        const paymentStats = paymentService.getPaymentStats();
        setStats(paymentStats);
        setLoading(false);
    };

    const handleApprovePayment = async (paymentId: string) => {
        if (processing) return;

        if (!confirm('Bạn có chắc muốn duyệt thanh toán này?')) return;

        setProcessing(paymentId);

        // Simulate admin processing time
        setTimeout(() => {
            const payment = paymentService.getPaymentRequest(paymentId);
            if (!payment) {
                setProcessing(null);
                return;
            }

            // Update payment status
            const success = paymentService.updatePaymentStatus(paymentId, 'COMPLETED', {
                approvedBy: 'admin',
                adminNote: 'Đã duyệt bởi admin',
                approvedAt: new Date().toISOString()
            });

            if (success && payment.type === 'TOP_UP') {
                // Add money to user's wallet
                fakeWalletService.topUp({
                    amount: payment.amount,
                    paymentMethod: 'BANKING',
                    description: `Nạp tiền được admin duyệt - ${payment.id}`
                });
            }

            setProcessing(null);
            loadPayments();
            alert('✅ Đã duyệt thanh toán thành công!');
        }, 2000);
    };

    const handleRejectPayment = async (paymentId: string) => {
        if (processing) return;

        const reason = prompt('Nhập lý do từ chối:');
        if (!reason) return;

        setProcessing(paymentId);

        setTimeout(() => {
            paymentService.updatePaymentStatus(paymentId, 'FAILED', {
                rejectedBy: 'admin',
                adminNote: reason,
                failureReason: reason,
                rejectedAt: new Date().toISOString()
            });

            setProcessing(null);
            loadPayments();
            alert('❌ Đã từ chối thanh toán!');
        }, 1000);
    };

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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: PaymentStatus) => {
        const badges = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'PROCESSING': 'bg-blue-100 text-blue-800',
            'WAITING_APPROVAL': 'bg-orange-100 text-orange-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'FAILED': 'bg-red-100 text-red-800',
            'EXPIRED': 'bg-gray-100 text-gray-800',
            'CANCELLED': 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải danh sách thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Header />

                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            👨‍💼 Quản lý thanh toán
                        </h1>
                        <p className="text-slate-600">
                            Duyệt và quản lý các yêu cầu nạp tiền của người dùng
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Chờ duyệt</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <span className="text-orange-600 text-xl">⏳</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Đã duyệt</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <span className="text-green-600 text-xl">✅</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Từ chối</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <span className="text-red-600 text-xl">❌</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Tổng tiền</p>
                                    <p className="text-xl font-bold text-blue-600">{formatPrice(stats.totalAmount)}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <span className="text-blue-600 text-xl">💰</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payments List */}
                    <div className="bg-white rounded-2xl shadow-lg border border-white/50">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    📋 Danh sách thanh toán cần duyệt
                                </h3>
                                <button
                                    onClick={loadPayments}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    🔄 Làm mới
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {payments.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-slate-400 text-2xl">📭</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                                        Không có thanh toán nào
                                    </h3>
                                    <p className="text-slate-600">
                                        Tất cả thanh toán đã được xử lý
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {payments.map((payment) => (
                                        <div key={payment.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 mb-1">
                                                        #{payment.id}
                                                    </h4>
                                                    <p className="text-sm text-slate-600">
                                                        {formatDate(payment.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-green-600 mb-1">
                                                        {formatPrice(payment.amount)}
                                                    </p>
                                                    {getStatusBadge(payment.status)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <label className="text-xs text-slate-500">Người dùng</label>
                                                    <p className="font-medium">User ID: {payment.userId}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">Loại giao dịch</label>
                                                    <p className="font-medium">{payment.type}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-slate-500">Mô tả</label>
                                                    <p className="font-medium">{payment.description}</p>
                                                </div>
                                            </div>

                                            {payment.status === 'PENDING' && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleApprovePayment(payment.id)}
                                                        disabled={processing === payment.id}
                                                        className="flex-1 bg-green-500 text-white font-medium py-3 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors"
                                                    >
                                                        {processing === payment.id ? (
                                                            <div className="flex items-center justify-center">
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                Đang duyệt...
                                                            </div>
                                                        ) : (
                                                            '✅ Duyệt'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectPayment(payment.id)}
                                                        disabled={processing === payment.id}
                                                        className="flex-1 bg-red-500 text-white font-medium py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                                                    >
                                                        ❌ Từ chối
                                                    </button>
                                                </div>
                                            )}

                                            {payment.metadata?.adminNote && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Ghi chú admin:</strong> {payment.metadata.adminNote}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
} 