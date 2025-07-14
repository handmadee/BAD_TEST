"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Court } from "@/lib/api";

// Extend Court interface để include distance data
interface CourtWithDistance extends Court {
    distanceNumber: number;
    coordinates?: { lat: number; lng: number } | null;
}

interface CourtsContextType {
    // Cached data
    courts: CourtWithDistance[];
    setCourts: (courts: CourtWithDistance[]) => void;

    userLocation: { lat: number; lng: number } | null;
    setUserLocation: (location: { lat: number; lng: number } | null) => void;

    selectedCourt: Court | null;
    setSelectedCourt: (court: Court | null) => void;

    filters: {
        sport: "Cầu lông" | "Pickleball" | "Cả hai" | "";
        sortBy: "price" | "rating" | "distance";
        page: number;
        limit: number;
    };
    setFilters: (filters: any) => void;

    pagination: {
        totalPages: number;
        total: number;
    };
    setPagination: (pagination: { totalPages: number; total: number }) => void;

    loading: boolean;
    setLoading: (loading: boolean) => void;

    // Cache flags
    isDataCached: boolean;
    clearCache: () => void;
}

const CourtsContext = createContext<CourtsContextType | undefined>(undefined);

export function CourtsProvider({ children }: { children: ReactNode }) {
    const [courts, setCourts] = useState<CourtWithDistance[]>([]);
    const [userLocation, setUserLocation] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDataCached, setIsDataCached] = useState(false);

    const [filters, setFiltersState] = useState({
        sport: "" as "Cầu lông" | "Pickleball" | "Cả hai" | "",
        sortBy: "distance" as "price" | "rating" | "distance",
        page: 1,
        limit: 9,
    });

    const [pagination, setPagination] = useState({
        totalPages: 1,
        total: 0,
    });

    const setFilters = (newFilters: any) => {
        setFiltersState(newFilters);
    };

    const setCourtsWithCache = (newCourts: CourtWithDistance[]) => {
        setCourts(newCourts);
        setIsDataCached(true);
    };

    const clearCache = () => {
        setCourts([]);
        setIsDataCached(false);
        setSelectedCourt(null);
    };

    return (
        <CourtsContext.Provider
            value={{
                courts,
                setCourts: setCourtsWithCache,
                userLocation,
                setUserLocation,
                selectedCourt,
                setSelectedCourt,
                filters,
                setFilters,
                pagination,
                setPagination,
                loading,
                setLoading,
                isDataCached,
                clearCache,
            }}
        >
            {children}
        </CourtsContext.Provider>
    );
}

export function useCourts() {
    const context = useContext(CourtsContext);
    if (context === undefined) {
        throw new Error("useCourts must be used within a CourtsProvider");
    }
    return context;
}
