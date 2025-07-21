import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fakeWalletService } from '@/lib/fake-wallet-service';
import { paymentService } from '@/lib/payment-service';
import { PaymentMethod } from '@/types/wallet';
import { PaymentMethod as PaymentMethodType } from '@/types/payment';
import { authService } from '@/lib';

interface TopUpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const router = useRouter();
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('VIET_QR');
    const [processing, setProcessing] = useState(false);

    const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount);

        if (numAmount < 10000) {
            alert('Số tiền nạp tối thiểu là 10,000 VND');
            return;
        }

        setProcessing(true);

        try {
            // Get current user
            const userResponse = await authService.getCurrentUser();
            if (!userResponse.success) {
                alert('Vui lòng đăng nhập để tiếp tục');
                return;
            }

            // Create payment request
            const paymentRequest = paymentService.createPaymentRequest(
                userResponse.data.id,
                'TOP_UP',
                paymentMethod,
                numAmount,
                `Nạp tiền vào ví - ${formatPrice(numAmount)}`
            );

            // Redirect to payment page
            setProcessing(false);
            onClose();
            router.push(`/payment/${paymentRequest.id}`);

        } catch (error) {
            console.error('Error creating payment:', error);
            setProcessing(false);
            alert('❌ Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">💳 Nạp tiền vào ví</h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Amount Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            💰 Số tiền nạp
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số tiền..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                            required
                            min="10000"
                        />
                        {amount && (
                            <p className="text-sm text-slate-600 mt-2">
                                = {formatPrice(parseInt(amount) || 0)}
                            </p>
                        )}
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-slate-700 mb-3">
                            ⚡ Số tiền thông dụng
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {quickAmounts.map(quickAmount => (
                                <button
                                    key={quickAmount}
                                    type="button"
                                    onClick={() => setAmount(quickAmount.toString())}
                                    className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                                >
                                    {formatPrice(quickAmount)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-3">
                            🔄 Phương thức thanh toán
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'VIET_QR', label: 'VietQR', icon: '📱' },
                                { value: 'ADMIN_APPROVAL', label: 'Admin duyệt', icon: '👨‍💼' }
                            ].map(method => (
                                <label
                                    key={method.value}
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === method.value
                                        ? 'border-amber-500 bg-amber-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.value}
                                        checked={paymentMethod === method.value}
                                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                                        className="sr-only"
                                    />
                                    <span className="text-xl mr-3">{method.icon}</span>
                                    <span className="font-medium">{method.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!amount || processing}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {processing ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Đang xử lý...
                            </div>
                        ) : (
                            `Nạp ${amount ? formatPrice(parseInt(amount)) : '0'}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    availableBalance: number;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    availableBalance
}) => {
    const [amount, setAmount] = useState<string>('');
    const [bankName, setBankName] = useState<string>('');
    const [bankAccount, setBankAccount] = useState<string>('');
    const [accountHolder, setAccountHolder] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount);

        if (numAmount < 50000) {
            alert('Số tiền rút tối thiểu là 50,000 VND');
            return;
        }

        if (numAmount > availableBalance) {
            alert('Số dư không đủ để thực hiện giao dịch');
            return;
        }

        setProcessing(true);

        setTimeout(() => {
            const transaction = fakeWalletService.withdraw({
                amount: numAmount,
                bankName,
                bankAccount,
                accountHolder,
                description: `Rút tiền về ${bankName}`
            });

            if (transaction) {
                setProcessing(false);
                setAmount('');
                setBankName('');
                setBankAccount('');
                setAccountHolder('');
                onSuccess();
                onClose();
                alert('🎉 Yêu cầu rút tiền đã được gửi!');
            }
        }, 2000);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">🏦 Rút tiền từ ví</h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Available Balance */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-600 mb-1">Số dư khả dụng</p>
                        <p className="text-xl font-bold text-blue-800">
                            {formatPrice(availableBalance)}
                        </p>
                    </div>

                    {/* Amount */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            💰 Số tiền rút
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số tiền..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            min="50000"
                            max={availableBalance}
                        />
                    </div>

                    {/* Bank Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            🏦 Tên ngân hàng
                        </label>
                        <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Chọn ngân hàng</option>
                            <option value="Vietcombank">Vietcombank</option>
                            <option value="VietinBank">VietinBank</option>
                            <option value="BIDV">BIDV</option>
                            <option value="Agribank">Agribank</option>
                            <option value="Techcombank">Techcombank</option>
                            <option value="VPBank">VPBank</option>
                            <option value="Sacombank">Sacombank</option>
                        </select>
                    </div>

                    {/* Account Number */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            🔢 Số tài khoản
                        </label>
                        <input
                            type="text"
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            placeholder="Nhập số tài khoản..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Account Holder */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            👤 Chủ tài khoản
                        </label>
                        <input
                            type="text"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            placeholder="Họ và tên chủ tài khoản..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!amount || !bankName || !bankAccount || !accountHolder || processing}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {processing ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Đang xử lý...
                            </div>
                        ) : (
                            `Rút ${amount ? formatPrice(parseInt(amount)) : '0'}`
                        )}
                    </button>

                    <p className="text-xs text-slate-500 text-center mt-4">
                        💡 Thời gian xử lý: 1-3 ngày làm việc
                    </p>
                </form>
            </div>
        </div>
    );
};

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    availableBalance: number;
}

export const TransferModal: React.FC<TransferModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    availableBalance
}) => {
    const [amount, setAmount] = useState<string>('');
    const [recipientName, setRecipientName] = useState<string>('');
    const [recipientPhone, setRecipientPhone] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount);

        if (numAmount < 10000) {
            alert('Số tiền chuyển tối thiểu là 10,000 VND');
            return;
        }

        if (numAmount > availableBalance) {
            alert('Số dư không đủ để thực hiện giao dịch');
            return;
        }

        setProcessing(true);

        setTimeout(() => {
            const transaction = fakeWalletService.transfer({
                recipientId: 999, // Fake recipient ID
                amount: numAmount,
                recipientName,
                description: description || `Chuyển tiền cho ${recipientName}`
            });

            if (transaction) {
                setProcessing(false);
                setAmount('');
                setRecipientName('');
                setRecipientPhone('');
                setDescription('');
                onSuccess();
                onClose();
                alert('🎉 Chuyển tiền thành công!');
            }
        }, 2000);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">💸 Chuyển tiền</h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Available Balance */}
                    <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                        <p className="text-sm text-purple-600 mb-1">Số dư khả dụng</p>
                        <p className="text-xl font-bold text-purple-800">
                            {formatPrice(availableBalance)}
                        </p>
                    </div>

                    {/* Recipient Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            👤 Tên người nhận
                        </label>
                        <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Nhập tên người nhận..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    {/* Recipient Phone */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            📱 Số điện thoại người nhận
                        </label>
                        <input
                            type="tel"
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            placeholder="Nhập số điện thoại..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            💰 Số tiền chuyển
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Nhập số tiền..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                            min="10000"
                            max={availableBalance}
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            📝 Lời nhắn (tùy chọn)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ghi chú giao dịch..."
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!amount || !recipientName || !recipientPhone || processing}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {processing ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Đang xử lý...
                            </div>
                        ) : (
                            `Chuyển ${amount ? formatPrice(parseInt(amount)) : '0'}`
                        )}
                    </button>

                    <p className="text-xs text-slate-500 text-center mt-4">
                        💡 Chuyển tiền nội bộ miễn phí
                    </p>
                </form>
            </div>
        </div>
    );
}; 