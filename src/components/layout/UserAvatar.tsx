"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function UserAvatar({ size = "sm", className }: UserAvatarProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [initial, setInitial] = useState("U");

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;

            // Google OAuth: avatar_url and full_name in user_metadata
            const meta = user.user_metadata;
            if (meta?.avatar_url) {
                setAvatarUrl(meta.avatar_url);
            }

            // Fallback initial: from full_name, display_name, or email
            const name = meta?.full_name || meta?.name || user.email || "U";
            setInitial(name.charAt(0).toUpperCase());
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
