"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "USER" | "COURT_OWNER" | "ADMIN";
    fallbackPath?: string;
}

export default function ProtectedRoute({
    children,
    requiredRole,
    fallbackPath = "/auth/signin",
}: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                // Redirect to login if not authenticated
                router.push(fallbackPath);
                return;
            }

            if (requiredRole && user?.role !== requiredRole) {
                // Redirect if user doesn't have required role
                router.push("/unauthorized");
                return;
            }
        }
    }, [isLoading, isAuthenticated, user, requiredRole, router, fallbackPath]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#c0162d] mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">
                        Đang kiểm tra đăng nhập...
                    </p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated or doesn't have required role
    if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
        return null;
    }

    return <>{children}</>;
}
