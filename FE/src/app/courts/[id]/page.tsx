"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Court, CourtPricing, Booking, User } from "@/types/api";
import { courtService, authService } from "@/lib";
import { fakeBookingService } from "@/lib/fake-booking-service";
import { fakeWalletService } from "@/lib/fake-wallet-service";
import { BookingSuccessModal } from "@/components/ui/BookingSuccessModal";

interface BookingFormData {
    date: string;
    selectedSlots: string[];
    notes: string;
}

interface BookingOrder {
    startTime: string;
    endTime: string;
    slots: string[];
    duration: number;
    price: number;
}

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export default function CourtDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const courtId = parseInt(params.id as string);
    const [court, setCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<"weekday" | "weekend">("weekday");

    // Booking states
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
    const [bookingForm, setBookingForm] = useState<BookingFormData>({
        date: "",
        selectedSlots: [],
        notes: ""
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
    const [bookingPrice, setBookingPrice] = useState<number>(0);
    const [processing, setProcessing] = useState(false);
    const [walletBalance, setWalletBalance] = useState<number>(0);

    // Payment methods
    const paymentMethods: PaymentMethod[] = [
        {
            id: "wallet",
            name: "Ví của tôi",
            icon: "💰",
            description: "Thanh toán từ ví nội bộ"
        },
        {
            id: "momo",
            name: "Ví MoMo",
            icon: "💳",
            description: "Thanh toán nhanh qua ví điện tử MoMo"
        },
        {
            id: "banking",
            name: "Chuyển khoản",
            icon: "🏦",
            description: "Chuyển khoản qua ngân hàng"
        },
        {
            id: "zalopay",
            name: "ZaloPay",
            icon: "⚡",
            description: "Thanh toán qua ZaloPay"
        },
        {
            id: "cash",
            name: "Tiền mặt",
            icon: "💵",
            description: "Thanh toán trực tiếp tại sân"
        }
    ];

    // Available time slots with status
    const generateTimeSlots = () => {
        const slots = [
            { value: "06:00", label: "06:00 - 07:00" },
            { value: "07:00", label: "07:00 - 08:00" },
            { value: "08:00", label: "08:00 - 09:00" },
            { value: "09:00", label: "09:00 - 10:00" },
            { value: "10:00", label: "10:00 - 11:00" },
            { value: "11:00", label: "11:00 - 12:00" },
            { value: "12:00", label: "12:00 - 13:00" },
            { value: "13:00", label: "13:00 - 14:00" },
            { value: "14:00", label: "14:00 - 15:00" },
            { value: "15:00", label: "15:00 - 16:00" },
            { value: "16:00", label: "16:00 - 17:00" },
            { value: "17:00", label: "17:00 - 18:00" },
            { value: "18:00", label: "18:00 - 19:00" },
            { value: "19:00", label: "19:00 - 20:00" },
            { value: "20:00", label: "20:00 - 21:00" },
            { value: "21:00", label: "21:00 - 22:00" }
        ];

        return slots.map(slot => {
            const slotDateTime = getSlotDateTime(slot.value);
            const now = new Date();
            const isDisabled = slotDateTime <= now;

            // Simulate some booked and pending slots
            const bookedSlots = ['09:00', '14:00', '19:00']; // Red - booked
            const pendingSlots = ['10:00', '15:00']; // Yellow - pending

            let status = 'available'; // Green - available
            if (isDisabled) status = 'disabled'; // Gray - past time
            else if (bookedSlots.includes(slot.value)) status = 'booked'; // Red
            else if (pendingSlots.includes(slot.value)) status = 'pending'; // Yellow

            return {
                ...slot,
                status,
                disabled: isDisabled || status === 'booked'
            };
        });
    };

    const getSlotDateTime = (timeValue: string) => {
        if (!bookingForm.date) return new Date();
        const [hours, minutes] = timeValue.split(':').map(Number);
        const date = new Date(bookingForm.date);
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const timeSlots = generateTimeSlots();

    // Helper functions for slot management
    const getConsecutiveGroups = (slots: string[]): BookingOrder[] => {
        if (slots.length === 0) return [];

        const sortedSlots = [...slots].sort();
        const groups: BookingOrder[] = [];
        let currentGroup: string[] = [sortedSlots[0]];

        for (let i = 1; i < sortedSlots.length; i++) {
            const currentHour = parseInt(sortedSlots[i].split(':')[0]);
            const prevHour = parseInt(sortedSlots[i - 1].split(':')[0]);

            if (currentHour === prevHour + 1) {
                currentGroup.push(sortedSlots[i]);
            } else {
                // Create booking order for current group
                const startTime = currentGroup[0];
                const endHour = parseInt(currentGroup[currentGroup.length - 1].split(':')[0]) + 1;
                const endTime = `${endHour.toString().padStart(2, '0')}:00`;

                groups.push({
                    startTime,
                    endTime,
                    slots: [...currentGroup],
                    duration: currentGroup.length,
                    price: calculateGroupPrice(currentGroup)
                });

                currentGroup = [sortedSlots[i]];
            }
        }

        // Add the last group
        if (currentGroup.length > 0) {
            const startTime = currentGroup[0];
            const endHour = parseInt(currentGroup[currentGroup.length - 1].split(':')[0]) + 1;
            const endTime = `${endHour.toString().padStart(2, '0')}:00`;

            groups.push({
                startTime,
                endTime,
                slots: [...currentGroup],
                duration: currentGroup.length,
                price: calculateGroupPrice(currentGroup)
            });
        }

        return groups;
    };

    const calculateGroupPrice = (slots: string[]): number => {
        if (!court?.pricing || !bookingForm.date) return 0;

        let totalPrice = 0;
        const bookingDate = new Date(bookingForm.date);
        const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6;

        slots.forEach(slot => {
            const startHour = parseInt(slot.split(':')[0]);
            const pricing = court.pricing?.find(p => {
                const timeStart = parseInt(p.timeSlot.split('-')[0]);
                return startHour >= timeStart;
            });

            if (pricing) {
                const pricePerHour = isWeekend ? pricing.weekendPrice : pricing.weekdayPrice;
                totalPrice += pricePerHour;
            }
        });

        return totalPrice;
    };

    const bookingOrders = getConsecutiveGroups(bookingForm.selectedSlots);
    const totalBookingPrice = bookingOrders.reduce((sum, order) => sum + order.price, 0);

    useEffect(() => {
        if (bookingForm.selectedSlots.length > 0 && bookingForm.date) {
            calculateBookingPrice();
        }
    }, [bookingForm.selectedSlots, bookingForm.date]);

    useEffect(() => {
        loadCourtDetails();
        loadCurrentUser();
    }, [courtId]);

    const loadCurrentUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            if (response.success) {
                setCurrentUser(response.data);

                // Load wallet balance
                const wallet = fakeWalletService.getWallet();
                if (!wallet) {
                    fakeWalletService.initializeWallet(response.data.id);
                    setWalletBalance(fakeWalletService.getWallet()?.balance || 0);
                } else {
                    setWalletBalance(wallet.balance);
                }
            }
        } catch (error) {
            console.error("Error loading user:", error);
        }
    };

    const loadCourtDetails = async () => {
        try {
            setLoading(true);
            const response = await courtService.getCourtById(courtId);
            if (response.success) {
                setCourt(response.data);
            }
        } catch (error) {
            console.error("Error loading court details:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateBookingPrice = () => {
        if (!court?.pricing || bookingForm.selectedSlots.length === 0 || !bookingForm.date) {
            setBookingPrice(0);
            return;
        }

        setBookingPrice(totalBookingPrice);
    };

    const handleBookingSubmit = () => {
        if (!currentUser) {
            router.push('/auth/signin');
            return;
        }

        if (!bookingForm.date || bookingForm.selectedSlots.length === 0) {
            alert('Vui lòng chọn ngày và ít nhất một khung giờ');
            return;
        }

        setShowBookingModal(false);
        setShowPaymentModal(true);
    };

    const processPayment = async () => {
        if (!selectedPaymentMethod) {
            alert('Vui lòng chọn phương thức thanh toán');
            return;
        }

        setProcessing(true);

        // Check if using non-wallet payment methods
        if (selectedPaymentMethod !== 'wallet') {
            setProcessing(false);
            alert('🚧 Hệ thống đang được tích hợp và triển khai\n\n📋 Thông tin:\n• Các phương thức thanh toán khác đang được phát triển\n• Hiện tại chỉ hỗ trợ thanh toán qua Ví\n• Vui lòng sử dụng Ví để thanh toán hoặc quay lại sau\n\n💡 Gợi ý: Nạp tiền vào ví để đặt sân ngay!');
            return;
        }

        // Simulate payment processing
        setTimeout(() => {
            // Process wallet payment if selected
            if (selectedPaymentMethod === 'wallet') {
                const walletPayment = fakeWalletService.payForBooking(
                    bookingPrice,
                    Date.now(),
                    court!.name
                );

                if (!walletPayment) {
                    setProcessing(false);
                    alert('❌ Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền hoặc chọn phương thức khác.');
                    return;
                }
            }

            // Create multiple bookings for each consecutive group
            const createdBookings: Booking[] = [];

            bookingOrders.forEach((order, index) => {
                const newBooking: Booking = {
                    id: fakeBookingService.generateBookingId(),
                    court: court!,
                    user: currentUser!,
                    bookingDate: bookingForm.date,
                    startTime: order.startTime,
                    endTime: order.endTime,
                    totalPrice: order.price,
                    status: "CONFIRMED",
                    notes: bookingForm.notes + (bookingOrders.length > 1 ? ` (Đơn ${index + 1}/${bookingOrders.length})` : ''),
                    createdAt: new Date().toISOString()
                };

                fakeBookingService.saveBooking(newBooking);
                createdBookings.push(newBooking);
            });

            // Reset states
            setProcessing(false);
            setShowPaymentModal(false);
            // Use first booking for success modal, but mention multiple if applicable
            setCompletedBooking(createdBookings[0]);
            setShowSuccessModal(true);

            // Reset form
            setBookingForm({ date: "", selectedSlots: [], notes: "" });
            setSelectedPaymentMethod("");
            setBookingPrice(0);
        }, 3000);
    };

    const handleSlotToggle = (slotValue: string) => {
        const slot = timeSlots.find(s => s.value === slotValue);
        if (!slot || slot.disabled) return;

        setBookingForm(prev => ({
            ...prev,
            selectedSlots: prev.selectedSlots.includes(slotValue)
                ? prev.selectedSlots.filter(s => s !== slotValue)
                : [...prev.selectedSlots, slotValue].sort()
        }));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push("★");
        }
        if (hasHalfStar) {
            stars.push("☆");
        }
        while (stars.length < 5) {
            stars.push("☆");
        }

        return (
            <div className="flex items-center space-x-1">
                <span className="text-amber-400 text-lg">{stars.join("")}</span>
                <span className="text-gray-600 ml-2">
                    ({rating.toFixed(1)})
                </span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin sân...</p>
                </div>
            </div>
        );
    }

    if (!court) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        Không tìm thấy sân
                    </h1>
                    <p className="text-gray-600">
                        Sân bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => window.history.back()}
                                className="text-slate-600 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-xl"
                            >
                                ← Quay lại
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    {court.name}
                                </h1>
                                <p className="text-sm text-slate-600">
                                    📍 {court.address}
                                </p>
                            </div>
                        </div>
                        {court.averageRating && (
                            <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-xl">
                                <span className="text-amber-500">⭐</span>
                                <span className="font-semibold text-slate-800">
                                    {court.averageRating.toFixed(1)}
                                </span>
                                <span className="text-slate-500 text-sm">
                                    ({court.totalReviews})
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Images - Compact & Beautiful */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/50">
                            <div className="aspect-[4/1.5] bg-gradient-to-r from-slate-100 to-slate-200 relative">
                                {court.images && court.images.length > 0 ? (
                                    <img
                                        src={court.images[0]}
                                        alt={court.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <span className="text-lg">
                                            📷 Chưa có hình ảnh
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            {court.images && court.images.length > 1 && (
                                <div className="p-4 grid grid-cols-6 gap-2">
                                    {court.images
                                        .slice(1, 7)
                                        .map((image, index) => (
                                            <div
                                                key={index}
                                                className="aspect-square rounded-lg overflow-hidden"
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${court.name} ${index + 2
                                                        }`}
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                                                />
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Info Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Description */}
                            <div className="md:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-blue-600">
                                            📝
                                        </span>
                                    </div>
                                    Mô tả sân
                                </h2>
                                <p className="text-slate-700 leading-relaxed">
                                    {court.description ||
                                        "Chưa có mô tả chi tiết"}
                                </p>
                            </div>

                            {/* Quick Info */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-green-600">
                                            ℹ️
                                        </span>
                                    </div>
                                    Thông tin
                                </h2>
                                <div className="space-y-3">
                                    {court.operatingHours && (
                                        <div className="flex items-center p-2 bg-slate-50 rounded-lg">
                                            <span className="text-green-600 w-6">
                                                🕐
                                            </span>
                                            <span className="text-slate-700 text-sm ml-2">
                                                {court.operatingHours}
                                            </span>
                                        </div>
                                    )}
                                    {court.sportTypes && (
                                        <div className="flex flex-wrap gap-1">
                                            {court.sportTypes
                                                .split(",")
                                                .map((sport, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-medium"
                                                    >
                                                        {sport.trim()}
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        {court.amenities && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        <span className="text-purple-600">
                                            ✨
                                        </span>
                                    </div>
                                    Tiện ích
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {court.amenities
                                        .split(",")
                                        .map((amenity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border"
                                            >
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                                <span className="text-slate-700 text-sm font-medium">
                                                    {amenity.trim()}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing */}
                        {court.pricing && court.pricing.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/50">
                                {/* Modern Tabs */}
                                <div className="p-6 pb-0">
                                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                            <span className="text-emerald-600">
                                                💰
                                            </span>
                                        </div>
                                        Bảng giá
                                    </h2>
                                    <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                                        <button
                                            onClick={() =>
                                                setSelectedDay("weekday")
                                            }
                                            className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${selectedDay === "weekday"
                                                ? "bg-white text-slate-900 shadow-md"
                                                : "text-slate-600 hover:text-slate-800"
                                                }`}
                                        >
                                            📅 Thứ 2-6
                                        </button>
                                        <button
                                            onClick={() =>
                                                setSelectedDay("weekend")
                                            }
                                            className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${selectedDay === "weekend"
                                                ? "bg-white text-slate-900 shadow-md"
                                                : "text-slate-600 hover:text-slate-800"
                                                }`}
                                        >
                                            🎉 T7-CN
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 pb-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {court.pricing.map((pricing, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200"
                                            >
                                                <div className="text-xs font-medium text-slate-600 mb-2">
                                                    {pricing.timeSlot}
                                                </div>
                                                <div className="text-lg font-bold text-slate-900">
                                                    {formatPrice(
                                                        selectedDay ===
                                                            "weekday"
                                                            ? pricing.weekdayPrice
                                                            : pricing.weekendPrice
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <p className="text-sm text-blue-800">
                                            💡{" "}
                                            <span className="font-medium">
                                                Lưu ý:
                                            </span>{" "}
                                            Giá trên đã bao gồm các dịch vụ cơ
                                            bản. Liên hệ trực tiếp để đặt sân và
                                            xác nhận.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 sticky top-6">
                            {/* Contact Actions */}
                            <div className="space-y-3 mb-6">
                                {court.phone && (
                                    <a
                                        href={`tel:${court.phone}`}
                                        className="block w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        📞 {court.phone}
                                    </a>
                                )}
                                {court.email && (
                                    <a
                                        href={`mailto:${court.email}`}
                                        className="block w-full border-2 border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl hover:bg-slate-50 transition-all duration-200 text-center"
                                    >
                                        ✉️ Gửi email
                                    </a>
                                )}
                            </div>

                            <div className="border-t border-slate-200 pt-6">
                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                                >
                                    🏸 ĐẶT SÂN NGAY
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-3">
                                    Đặt sân online nhanh chóng và tiện lợi
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Đặt sân</h2>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Date Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        📅 Chọn ngày
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingForm.date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {/* Time Slot Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">
                                        🕐 Chọn khung giờ (có thể chọn nhiều)
                                    </label>

                                    {/* Legend */}
                                    <div className="flex flex-wrap gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                                            <span className="text-xs text-slate-600">Còn trống</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                                            <span className="text-xs text-slate-600">Đang đặt</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-red-600 rounded mr-2"></div>
                                            <span className="text-xs text-slate-600">Đã đặt</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-slate-400 rounded mr-2"></div>
                                            <span className="text-xs text-slate-600">Đã qua</span>
                                        </div>
                                    </div>

                                    {/* Time Slots Grid */}
                                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                        {timeSlots.map(slot => {
                                            const isSelected = bookingForm.selectedSlots.includes(slot.value);

                                            const getSlotStyles = () => {
                                                const baseStyles = "p-3 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer hover:shadow-md";

                                                if (isSelected) {
                                                    return `${baseStyles} bg-blue-100 border-blue-400 text-blue-800 ring-2 ring-blue-400`;
                                                }

                                                switch (slot.status) {
                                                    case 'available':
                                                        return `${baseStyles} bg-green-50 border-green-200 text-green-800 hover:bg-green-100`;
                                                    case 'pending':
                                                        return `${baseStyles} bg-amber-50 border-amber-300 text-amber-800 cursor-not-allowed opacity-75`;
                                                    case 'booked':
                                                        return `${baseStyles} bg-red-50 border-red-300 text-red-800 cursor-not-allowed opacity-75`;
                                                    case 'disabled':
                                                        return `${baseStyles} bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50`;
                                                    default:
                                                        return baseStyles;
                                                }
                                            };

                                            const getSlotIcon = () => {
                                                if (isSelected) return '🔵';
                                                switch (slot.status) {
                                                    case 'available': return '✅';
                                                    case 'pending': return '⏳';
                                                    case 'booked': return '❌';
                                                    case 'disabled': return '🚫';
                                                    default: return '';
                                                }
                                            };

                                            return (
                                                <button
                                                    key={slot.value}
                                                    type="button"
                                                    disabled={slot.disabled}
                                                    onClick={() => handleSlotToggle(slot.value)}
                                                    className={getSlotStyles()}
                                                    title={`${slot.label} - ${isSelected ? 'Đã chọn' :
                                                        slot.status === 'available' ? 'Có thể đặt' :
                                                            slot.status === 'pending' ? 'Đang được đặt' :
                                                                slot.status === 'booked' ? 'Đã có người đặt' : 'Đã qua giờ'}`}
                                                >
                                                    <div className="text-center">
                                                        <div className="text-xs opacity-75 mb-1">{getSlotIcon()}</div>
                                                        <div className="font-semibold">{slot.value}</div>
                                                        <div className="text-xs opacity-75">1 giờ</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Selected Slots Summary */}
                                    {bookingForm.selectedSlots.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-blue-800 font-medium">📅 Đã chọn {bookingForm.selectedSlots.length} khung giờ:</span>
                                                </div>
                                                <div className="text-blue-700 text-sm">
                                                    {bookingForm.selectedSlots.sort().join(', ')}
                                                </div>
                                            </div>

                                            {/* Booking Orders Preview */}
                                            {bookingOrders.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium text-slate-700">
                                                        📋 Sẽ tạo {bookingOrders.length} đơn đặt:
                                                    </div>
                                                    {bookingOrders.map((order, index) => (
                                                        <div key={index} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium">
                                                                    Đơn {index + 1}: {order.startTime} - {order.endTime}
                                                                </span>
                                                                <span className="text-green-600 font-bold">
                                                                    {formatPrice(order.price)}
                                                                </span>
                                                            </div>
                                                            <div className="text-slate-600 text-xs">
                                                                {order.duration} giờ • {order.slots.join(', ')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        📝 Ghi chú (tùy chọn)
                                    </label>
                                    <textarea
                                        value={bookingForm.notes}
                                        onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Số người chơi, yêu cầu đặc biệt..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {/* Price Preview */}
                                {totalBookingPrice > 0 && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-green-800 font-medium">💰 Tổng tiền:</span>
                                            <span className="text-green-900 font-bold text-xl">{formatPrice(totalBookingPrice)}</span>
                                        </div>
                                        {bookingOrders.length > 1 && (
                                            <div className="text-green-700 text-sm mt-1">
                                                Chia thành {bookingOrders.length} đơn đặt riêng biệt
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowBookingModal(false)}
                                        className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleBookingSubmit}
                                        disabled={!bookingForm.date || bookingForm.selectedSlots.length === 0}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Tiếp tục thanh toán
                                    </button>
                                </div>

                                {/* Booking Notice */}
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-blue-800 text-sm">
                                        <span className="font-medium">📋 Lưu ý:</span> Có thể chọn nhiều khung giờ.
                                        Các khung giờ liên tiếp sẽ gộp thành 1 đơn, không liên tiếp sẽ tách thành nhiều đơn riêng.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Thanh toán</h2>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Booking Summary */}
                            <div className="bg-slate-50 rounded-lg p-4 mb-6">
                                <h3 className="font-medium text-slate-800 mb-3">📋 Thông tin đặt sân</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Sân:</span>
                                        <span className="font-medium">{court?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Ngày:</span>
                                        <span className="font-medium">{new Date(bookingForm.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Số đơn:</span>
                                        <span className="font-medium">{bookingOrders.length} đơn đặt</span>
                                    </div>

                                    {/* Orders breakdown */}
                                    {bookingOrders.map((order, index) => (
                                        <div key={index} className="ml-4 p-2 bg-white rounded border border-slate-200">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-600">Đơn {index + 1}:</span>
                                                <span className="font-medium">{order.startTime} - {order.endTime}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-600">Giá:</span>
                                                <span className="text-green-600 font-medium">{formatPrice(order.price)}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-between border-t border-slate-200 pt-2">
                                        <span className="text-slate-800 font-medium">Tổng tiền:</span>
                                        <span className="text-red-600 font-bold">{formatPrice(totalBookingPrice)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="mb-6">
                                <h3 className="font-medium text-slate-800 mb-3">💳 Chọn phương thức thanh toán</h3>
                                <div className="space-y-3">
                                    {paymentMethods.map(method => (
                                        <label
                                            key={method.id}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all relative ${selectedPaymentMethod === method.id
                                                ? method.id === 'wallet'
                                                    ? 'border-amber-500 bg-amber-50'
                                                    : 'border-red-500 bg-red-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                                } ${method.id !== 'wallet' ? 'opacity-75' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={selectedPaymentMethod === method.id}
                                                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center w-full">
                                                <span className="text-2xl mr-3">{method.icon}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium ${method.id === 'wallet' ? 'text-amber-900' : 'text-slate-900'}`}>
                                                            {method.name}
                                                        </span>
                                                        {method.id !== 'wallet' && (
                                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                                                                Đang phát triển
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-slate-600">
                                                        {method.id === 'wallet' ? method.description : 'Hệ thống đang được tích hợp và triển khai'}
                                                        {method.id === 'wallet' && (
                                                            <span className="block text-xs text-amber-600 font-medium mt-1">
                                                                Số dư: {formatPrice(walletBalance)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 ${selectedPaymentMethod === method.id
                                                    ? method.id === 'wallet'
                                                        ? 'border-amber-500 bg-amber-500'
                                                        : 'border-red-500 bg-red-500'
                                                    : 'border-slate-300'
                                                    }`}>
                                                    {selectedPaymentMethod === method.id && (
                                                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                                    )}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Payment Notice */}
                                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start">
                                        <span className="text-blue-600 mr-2 mt-0.5">🚧</span>
                                        <div>
                                            <h4 className="font-medium text-blue-800 mb-1">Thông báo hệ thống</h4>
                                            <p className="text-blue-700 text-sm leading-relaxed">
                                                <strong>Các phương thức thanh toán khác đang được tích hợp và triển khai.</strong><br />
                                                Hiện tại chỉ hỗ trợ thanh toán qua <strong>Ví nội bộ</strong>.
                                                Vui lòng nạp tiền vào ví để có thể đặt sân hoặc quay lại sau khi hệ thống hoàn thiện.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                    disabled={processing}
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={processPayment}
                                    disabled={!selectedPaymentMethod || processing}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Đang xử lý...
                                        </div>
                                    ) : (
                                        `Thanh toán ${formatPrice(totalBookingPrice)}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <BookingSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                booking={completedBooking}
                onViewBookings={() => {
                    router.push('/my-bookings');
                }}
            />
        </div>
    );
}
