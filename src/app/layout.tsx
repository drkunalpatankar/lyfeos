import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import BottomNav from "@/components/layout/BottomNav";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const siteUrl = "https://lyfeos.in";

export const metadata: Metadata = {
    title: "LyFeOS — The Life Operating System",
    description: "Reflect. Analyze. Grow. AI-powered daily journaling and weekly intelligence.",
    manifest: "/manifest.json",
    metadataBase: new URL(siteUrl),
    openGraph: {
        title: "LyFeOS — The Life Operating System",
        description: "Reflect. Analyze. Grow. AI-powered daily journaling and weekly intelligence.",
        url: siteUrl,
        siteName: "LyFeOS",
        images: [
            {
                url: `${siteUrl}/og-image.png?v=3`,
                width: 1200,
                height: 630,
                alt: "LyFeOS — The Life Operating System",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "LyFeOS — The Life Operating System",
        description: "Reflect. Analyze. Grow. AI-powered daily journaling and weekly intelligence.",
        images: [`${siteUrl}/og-image.png?v=3`],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "LyFeOS",
    },
    icons: {
        icon: [
            { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: "/apple-touch-icon.png",
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
                            "name": "LyFeOS",
                            "applicationCategory": "LifestyleApplication",
                            "operatingSystem": "Web",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "description": "AI-powered daily journaling and weekly intelligence for high performers.",
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
