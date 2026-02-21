"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

// Cache key for localStorage
const AVATAR_CACHE_KEY = "lyfeos_avatar";

interface AvatarCache {
    avatarUrl: string | null;
    initial: string;
    timestamp: number;
}

export default function UserAvatar({ size = "sm", className }: UserAvatarProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [initial, setInitial] = useState("U");
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // 1. Try localStorage cache first (instant, no network)
        try {
            const cached = localStorage.getItem(AVATAR_CACHE_KEY);
            if (cached) {
                const data: AvatarCache = JSON.parse(cached);
                // Cache valid for 1 hour
                if (Date.now() - data.timestamp < 3600000) {
                    setAvatarUrl(data.avatarUrl);
                    setInitial(data.initial);
                    setLoaded(true);
                    return; // Skip network call entirely
                }
            }
        } catch { }

        // 2. Fetch from Supabase (only on first load or expired cache)
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;

            const meta = user.user_metadata;
            const url = meta?.avatar_url || null;
            const name = meta?.full_name || meta?.name || user.email || "U";
            const ini = name.charAt(0).toUpperCase();

            setAvatarUrl(url);
            setInitial(ini);
            setLoaded(true);

            // Cache for future navigations
            try {
                localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify({
                    avatarUrl: url,
                    initial: ini,
                    timestamp: Date.now(),
                } as AvatarCache));
            } catch { }
        });
    }, []);

    const sizeClasses = {
        sm: "w-7 h-7 text-[10px]",
        md: "w-10 h-10 text-sm",
        lg: "w-16 h-16 text-xl",
    };

    return (
        <div
            className={cn(
                "rounded-full overflow-hidden flex items-center justify-center font-semibold shrink-0",
                "bg-gradient-to-br from-amber-500/30 to-rose-500/30 text-amber-200 border border-amber-500/20",
                sizeClasses[size],
                className
            )}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <span>{initial}</span>
            )}
        </div>
    );
}
