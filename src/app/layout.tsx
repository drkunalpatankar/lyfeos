import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import BottomNav from "@/components/layout/BottomNav";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",  // Add CSS variable
});

export const metadata: Metadata = {
    title: "LyFeOS - High Performance Life Analytics",
    description: "Journaling as Performance Analytics",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                {children}
                <BottomNav />
                <Toaster
                    theme="dark"
                    position="top-center"
                    toastOptions={{
                        style: {
                            background: 'rgba(30, 20, 10, 0.9)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            color: '#fde68a',
                            backdropFilter: 'blur(12px)',
                        },
                    }}
                />
            </body>
        </html>
    );
}
