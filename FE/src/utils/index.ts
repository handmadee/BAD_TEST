import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine classnames utility
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatPriceShort = (amount: number): string => {
    if (amount >= 1000000) {
        return Math.round(amount / 1000000) + "M";
    } else if (amount >= 1000) {
        return Math.round(amount / 1000) + "k";
    } else {
        return amount.toString();
    }
};

export const formatTimeSlot = (startTime: string, endTime: string): string => {
    return `${startTime} - ${endTime}`;
};

export const getDayNameVi = (dayKey: string): string => {
    const dayNames: { [key: string]: string } = {
        monday: "Thứ 2",
        tuesday: "Thứ 3",
        wednesday: "Thứ 4",
        thursday: "Thứ 5",
        friday: "Thứ 6",
        saturday: "Thứ 7",
        sunday: "Chủ nhật",
    };
    return dayNames[dayKey] || dayKey;
};

export const isPeakHours = (time: string): boolean => {
    const hour = parseInt(time.split(":")[0]);
    return hour >= 17 && hour <= 22; // 5PM - 10PM
};

export const getPriceRange = (
    dayPricings: any[]
): { min: number; max: number } => {
    let min = Infinity;
    let max = 0;

    dayPricings.forEach((dayPricing) => {
        dayPricing.timeSlots.forEach((slot: any) => {
            if (slot.price < min) min = slot.price;
            if (slot.price > max) max = slot.price;
        });
    });

    return { min: min === Infinity ? 0 : min, max };
};

export * from "./distance";

// Helper function để convert relative image URL thành full URL
export const getFullImageUrl = (imagePath: string): string => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http")) {
        return imagePath; // Already full URL
    }

    // Base URL không có /api vì imagePath đã có /api
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:8081";
    return baseUrl + imagePath;
};

// Helper function để validate image URL
export const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
};
