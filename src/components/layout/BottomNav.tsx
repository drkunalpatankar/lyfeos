"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, TrendingUp, Brain, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/layout/UserAvatar";
import { hasUnseenDigest, clearDigestBadge } from "@/components/layout/AutoDigestRunner";
import { createClient } from "@/lib/supabase/client";

const navItems = [
    { href: "/", label: "Log", icon: PenLine },
    { href: "/intentions", label: "Intentions", icon: Target },
    { href: "/dashboard", label: "Timeline", icon: TrendingUp },
    { href: "/digest", label: "Intel", icon: Brain },
];

const HIDDEN_PATHS = ["/login", "/privacy", "/terms"];

export default function BottomNav() {
    const pathname = usePathname();
    const [showBadge, setShowBadge] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Check auth state
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsAuthenticated(!!user);
        });
    }, []);

    // Check for digest badge
    useEffect(() => {
        const checkBadge = () => setShowBadge(hasUnseenDigest());
        checkBadge();

        window.addEventListener("digest-badge-update", checkBadge);
        return () => window.removeEventListener("digest-badge-update", checkBadge);
    }, []);

    // Clear badge when user visits digest page
    useEffect(() => {
        if (pathname === "/digest" && showBadge) {
            clearDigestBadge();
            setShowBadge(false);
        }
    }, [pathname, showBadge]);

    // Don't show on public/legal pages or for unauthenticated visitors
    if (HIDDEN_PATHS.includes(pathname)) return null;
    if (isAuthenticated === null) return null; // Still checking
    if (!isAuthenticated) return null; // Visitor on landing page

    const isSettingsActive = pathname === "/settings";

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
            <div className="grid grid-cols-5 h-16 w-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    const isIntel = item.href === "/digest";
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all relative",
                                isActive
                                    ? "text-amber-400"
                                    : "text-amber-200/40 hover:text-amber-200/70"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]")} />
                                {isIntel && showBadge && (
                                    <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-black/80 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                                )}
                            </div>
                            <span className="text-[9px] uppercase tracking-widest font-medium">{item.label}</span>
                        </Link>
                    );
                })}

                {/* Avatar / My Account */}
                <Link
                    href="/settings"
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 transition-all",
                        isSettingsActive
                            ? "text-amber-400"
                            : "text-amber-200/40 hover:text-amber-200/70"
                    )}
                >
                    <UserAvatar size="sm" className={cn(
                        isSettingsActive && "ring-2 ring-amber-400 ring-offset-1 ring-offset-black/80"
                    )} />
                    <span className="text-[9px] uppercase tracking-widest font-medium">Me</span>
                </Link>
            </div>
        </nav>
    );
}
