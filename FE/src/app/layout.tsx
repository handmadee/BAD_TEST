import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { CourtsProvider } from "@/context/CourtsContext";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Badminton Court Management",
    description: "Hệ thống quản lý sân cầu lông",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <AuthProvider>
                    <CourtsProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                                style: {
                                    background: "#363636",
                                    color: "#fff",
                                },
                            }}
                        />
                    </CourtsProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
