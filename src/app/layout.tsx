import type { Metadata, Viewport } from "next";
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
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "LifeOS",
    },
    icons: {
        apple: "/icon.png",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#0a0a0a",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": "LifeOS",
                            "applicationCategory": "LifestyleApplication",
                            "operatingSystem": "Web",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "description": "High-Performance Life Intelligence System helping you track metrics, reflect on days, and get weekly AI coaching.",
                            "aggregateRating": {
                                "@type": "AggregateRating",
                                "ratingValue": "5",
                                "ratingCount": "1"
                            }
                        })
                    }}
                />
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
