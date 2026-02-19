"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenLine, TrendingUp, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Log", icon: PenLine },
    { href: "/dashboard", label: "Timeline", icon: TrendingUp },
    { href: "/digest", label: "Intelligence", icon: Brain },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Don't show on login page
    if (pathname === "/login") return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
            <div className="grid grid-cols-3 h-16 w-full">
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
                            <span className="text-[10px] uppercase tracking-widest font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
