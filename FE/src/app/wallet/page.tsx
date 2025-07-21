"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fakeWalletService } from "@/lib/fake-wallet-service";
import { authService } from "@/lib";
import {
    Wallet,
    Transaction,
    WalletSummary,
    WalletStats,
    TransactionFilter,
    TransactionType,
    PaymentMethod
} from "@/types/wallet";
import { User } from "@/types/api";
import { TopUpModal, WithdrawModal, TransferModal } from "@/components/ui/WalletModals";

export default function WalletPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [summary, setSummary] = useState<WalletSummary | null>(null);
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'stats'>('overview');

    // Transaction filters
    const [filter, setFilter] = useState<TransactionFilter>({});
    const [showFilters, setShowFilters] = useState(false);

    // Modals
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        setLoading(true);
        try {
            // Load user
            const userResponse = await authService.getCurrentUser();
            if (userResponse.success) {
                const userData = userResponse.data;
                setUser(userData);

                // Initialize wallet if not exists
                let walletData = fakeWalletService.getWallet();
                if (!walletData) {
                    walletData = fakeWalletService.initializeWallet(userData.id);
                }

                // Load wallet data
                setWallet(walletData);
                setSummary(fakeWalletService.getWalletSummary());
                setStats(fakeWalletService.getStats());
                setTransactions(fakeWalletService.getFilteredTransactions(filter));
            }
        } catch (error) {
            console.error("Error loading wallet data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilter: TransactionFilter) => {
        setFilter(newFilter);
        setTransactions(fakeWalletService.getFilteredTransactions(newFilter));
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

    const getTransactionIcon = (type: TransactionType) => {
        const icons = {
            'BOOKING_PAYMENT': '🏸',
            'REFUND': '💫',
            'TOP_UP': '💳',
            'WITHDRAWAL': '🏦',
            'BONUS': '🎁',
            'PENALTY': '⚠️',
            'CASHBACK': '💰',
            'TRANSFER_IN': '⬇️',
            'TRANSFER_OUT': '⬆️'
        };
        return icons[type] || '💱';
    };

    const getTransactionColor = (type: TransactionType) => {
        const isCredit = !['BOOKING_PAYMENT', 'WITHDRAWAL', 'PENALTY', 'TRANSFER_OUT'].includes(type);
        return isCredit ? 'text-green-600' : 'text-red-600';
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            'COMPLETED': 'bg-green-100 text-green-800',
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'FAILED': 'bg-red-100 text-red-800',
            'CANCELLED': 'bg-gray-100 text-gray-800',
            'REFUNDED': 'bg-blue-100 text-blue-800'
        };
        const colorClass = badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải ví của bạn...</p>
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
                            💳 Ví của tôi
                        </h1>
                        <p className="text-slate-600">
                            Quản lý số dư, giao dịch và thống kê tài chính
                        </p>
                    </div>

                    {/* Wallet Overview Card */}
                    {wallet && summary && (
                        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-3xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-500/20"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold mb-2">Số dư khả dụng</h2>
                                        <p className="text-4xl font-bold">
                                            {formatPrice(summary.availableBalance)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-amber-100 text-sm">ID Ví</p>
                                        <p className="font-mono text-sm">{wallet.id.slice(-8)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                        <p className="text-amber-100 text-sm">Tổng thu nhập</p>
                                        <p className="text-xl font-bold">{formatPrice(wallet.totalEarned)}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                        <p className="text-amber-100 text-sm">Tổng chi tiêu</p>
                                        <p className="text-xl font-bold">{formatPrice(wallet.totalSpent)}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                        <p className="text-amber-100 text-sm">Giao dịch hôm nay</p>
                                        <p className="text-xl font-bold">{summary.todayTransactions}</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowTopUpModal(true)}
                                        className="flex-1 bg-yellow-400/20 hover:bg-yellow-400/30 backdrop-blur-sm border border-yellow-300/30 rounded-xl py-3 px-4 transition-all duration-200 font-semibold"
                                    >
                                        💳 Nạp tiền
                                    </button>
                                    <button
                                        onClick={() => setShowWithdrawModal(true)}
                                        className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl py-3 px-4 transition-all duration-200"
                                    >
                                        🏦 Rút tiền
                                    </button>
                                    <button
                                        onClick={() => setShowTransferModal(true)}
                                        className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl py-3 px-4 transition-all duration-200"
                                    >
                                        💸 Chuyển tiền
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs Navigation */}
                    <div className="flex bg-amber-50/70 backdrop-blur-sm rounded-2xl p-2 mb-6 border border-amber-200/50">
                        {[
                            { key: 'overview', label: '📊 Tổng quan', icon: '📊' },
                            { key: 'transactions', label: '📋 Giao dịch', icon: '📋' },
                            { key: 'stats', label: '📈 Thống kê', icon: '📈' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === tab.key
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-md text-white'
                                    : 'text-amber-700 hover:text-amber-800'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && summary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Quick Stats Cards */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <span className="text-green-600 text-xl">💰</span>
                                    </div>
                                    <span className="text-sm text-slate-500">Tuần này</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {formatPrice(summary.weeklySpending)}
                                </h3>
                                <p className="text-sm text-slate-600">Chi tiêu tuần</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <span className="text-purple-600 text-xl">📅</span>
                                    </div>
                                    <span className="text-sm text-slate-500">Tháng này</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {formatPrice(summary.monthlySpending)}
                                </h3>
                                <p className="text-sm text-slate-600">Chi tiêu tháng</p>
                            </div>

                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <span className="text-blue-600 text-xl">⏳</span>
                                    </div>
                                    <span className="text-sm text-slate-500">Đang chờ</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {formatPrice(summary.pendingAmount)}
                                </h3>
                                <p className="text-sm text-slate-600">Tiền chờ xử lý</p>
                            </div>

                            {/* Savings Goal */}
                            {summary.savingsGoal && (
                                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                            <span className="text-amber-600 text-xl">🎯</span>
                                        </div>
                                        <span className="text-sm text-slate-500">Mục tiêu</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {summary.savingsGoal.percentage.toFixed(1)}%
                                    </h3>
                                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(summary.savingsGoal.percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        {formatPrice(summary.savingsGoal.current)} / {formatPrice(summary.savingsGoal.target)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                            {/* Transaction Filters */}
                            <div className="p-6 border-b border-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        📋 Lịch sử giao dịch
                                    </h3>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                    >
                                        🔍 Bộ lọc
                                    </button>
                                </div>

                                {showFilters && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                                        <select
                                            value={filter.type || ''}
                                            onChange={(e) => handleFilterChange({ ...filter, type: e.target.value as TransactionType || undefined })}
                                            className="px-3 py-2 border border-slate-300 rounded-lg"
                                        >
                                            <option value="">Tất cả loại</option>
                                            <option value="BOOKING_PAYMENT">Thanh toán đặt sân</option>
                                            <option value="TOP_UP">Nạp tiền</option>
                                            <option value="WITHDRAWAL">Rút tiền</option>
                                            <option value="BONUS">Thưởng</option>
                                            <option value="CASHBACK">Hoàn tiền</option>
                                        </select>

                                        <select
                                            value={filter.paymentMethod || ''}
                                            onChange={(e) => handleFilterChange({ ...filter, paymentMethod: e.target.value as PaymentMethod || undefined })}
                                            className="px-3 py-2 border border-slate-300 rounded-lg"
                                        >
                                            <option value="">Tất cả phương thức</option>
                                            <option value="WALLET">Ví</option>
                                            <option value="MOMO">MoMo</option>
                                            <option value="BANKING">Ngân hàng</option>
                                            <option value="ZALOPAY">ZaloPay</option>
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm..."
                                            value={filter.reference || ''}
                                            onChange={(e) => handleFilterChange({ ...filter, reference: e.target.value || undefined })}
                                            className="px-3 py-2 border border-slate-300 rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Transactions List */}
                            <div className="p-6">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-slate-400 text-2xl">📭</span>
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                                            Chưa có giao dịch
                                        </h3>
                                        <p className="text-slate-600">
                                            Giao dịch của bạn sẽ xuất hiện ở đây
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {transactions.map((transaction) => (
                                            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border hover:shadow-md transition-all">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border shadow-sm">
                                                        <span className="text-xl">
                                                            {getTransactionIcon(transaction.type)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-slate-900">
                                                            {transaction.description}
                                                        </h4>
                                                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                                                            <span>{formatDate(transaction.createdAt)}</span>
                                                            {transaction.paymentMethod && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{transaction.paymentMethod}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                                                        {['BOOKING_PAYMENT', 'WITHDRAWAL', 'PENALTY', 'TRANSFER_OUT'].includes(transaction.type) ? '-' : '+'}
                                                        {formatPrice(transaction.amount)}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusBadge(transaction.status)}
                                                        <span className="text-xs text-slate-500">
                                                            {formatPrice(transaction.balance)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && stats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Trend Chart */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                                    📈 Xu hướng 6 tháng
                                </h3>
                                <div className="space-y-4">
                                    {stats.monthlyTrend.map((month, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium text-slate-700">
                                                {month.month}
                                            </span>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="text-green-600 text-sm">
                                                        +{formatPrice(month.income)}
                                                    </div>
                                                    <div className="text-red-600 text-sm">
                                                        -{formatPrice(month.expense)}
                                                    </div>
                                                </div>
                                                <div className="text-slate-600 text-sm">
                                                    {month.transactions} giao dịch
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Transaction Types */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                                    📊 Loại giao dịch
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.transactionsByType).map(([type, count]) => (
                                        <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">
                                                    {getTransactionIcon(type as TransactionType)}
                                                </span>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-slate-900 font-bold">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                                    📋 Tóm tắt thống kê
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {stats.totalTransactions}
                                        </p>
                                        <p className="text-sm text-blue-700">Tổng giao dịch</p>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatPrice(stats.totalIncome)}
                                        </p>
                                        <p className="text-sm text-green-700">Tổng thu nhập</p>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                                        <p className="text-2xl font-bold text-red-600">
                                            {formatPrice(stats.totalExpense)}
                                        </p>
                                        <p className="text-sm text-red-700">Tổng chi tiêu</p>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {formatPrice(stats.averageTransaction)}
                                        </p>
                                        <p className="text-sm text-purple-700">Trung bình/GD</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <TopUpModal
                    isOpen={showTopUpModal}
                    onClose={() => setShowTopUpModal(false)}
                    onSuccess={loadWalletData}
                />

                <WithdrawModal
                    isOpen={showWithdrawModal}
                    onClose={() => setShowWithdrawModal(false)}
                    onSuccess={loadWalletData}
                    availableBalance={wallet?.balance || 0}
                />

                <TransferModal
                    isOpen={showTransferModal}
                    onClose={() => setShowTransferModal(false)}
                    onSuccess={loadWalletData}
                    availableBalance={wallet?.balance || 0}
                />
            </div>
        </ProtectedRoute>
    );
} 