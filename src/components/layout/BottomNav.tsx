"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, TrendingUp, Brain, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/layout/UserAvatar";

const navItems = [
    { href: "/", label: "Log", icon: PenLine },
    { href: "/intentions", label: "Intentions", icon: Target },
    { href: "/dashboard", label: "Timeline", icon: TrendingUp },
    { href: "/digest", label: "Intel", icon: Brain },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Don't show on public/legal pages
    if (["/login", "/privacy", "/terms"].includes(pathname)) return null;

    const isSettingsActive = pathname === "/settings";

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
            <div className="grid grid-cols-5 h-16 w-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-all",
                                isActive
                                    ? "text-amber-400"
                                    : "text-amber-200/40 hover:text-amber-200/70"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]")} />
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
