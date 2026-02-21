"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateWeeklyDigest } from "@/actions/generate-digest";
import { startOfWeek, endOfWeek, format, isSaturday, getHours } from "date-fns";

const EXCLUDED_PATHS = ["/login", "/auth", "/terms", "/privacy"];
const AUTO_DIGEST_CHECK_KEY = "lyfeos_auto_digest_checked";
const DIGEST_BADGE_KEY = "lyfeos_digest_badge";

/**
 * AutoDigestRunner — invisible component mounted in layout.tsx
 * 
 * On app load (after unlock), checks if:
 * 1. It's past Saturday 11 PM local time
 * 2. No digest exists for this week
 * 3. User has >= 3 logs this week
 * If all true → auto-generates the digest in the background
 * and sets a badge flag in localStorage for BottomNav to display
 */
export default function AutoDigestRunner() {
    const pathname = usePathname();
    const hasRunRef = useRef(false);

    useEffect(() => {
        // Skip on public pages
        if (EXCLUDED_PATHS.some(p => pathname.startsWith(p))) return;
        // Only run once per app session
        if (hasRunRef.current) return;
        hasRunRef.current = true;

        const checkAndGenerate = async () => {
            try {
                // Check if we already ran today (avoid repeated calls)
                const today = format(new Date(), "yyyy-MM-dd");
                const lastChecked = localStorage.getItem(AUTO_DIGEST_CHECK_KEY);
                if (lastChecked === today) return; // Already checked today

                // Check auth
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const now = new Date();
                const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
                const currentHour = getHours(now);

                // Trigger condition: Saturday >= 23:00 OR Sunday (day after Saturday)
                const isSaturdayLate = currentDay === 6 && currentHour >= 23;
                const isSundayOrLater = currentDay === 0; // Sunday

                if (!isSaturdayLate && !isSundayOrLater) {
                    // Not the right time yet — mark as checked and skip
                    localStorage.setItem(AUTO_DIGEST_CHECK_KEY, today);
                    return;
                }

                // Check if digest already exists this week (the server action handles this)
                // We call with forceRegenerate = false so it returns cached if exists
                const result = await generateWeeklyDigest(false);

                if (result && 'cached' in result && result.cached) {
                    // Digest already exists — no need to generate
                    localStorage.setItem(AUTO_DIGEST_CHECK_KEY, today);
                    return;
                }

                if (result && 'success' in result && result.success) {
                    // Fresh digest was just generated!
                    // Set badge flag so BottomNav shows the notification dot
                    const weekStart = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");
                    localStorage.setItem(DIGEST_BADGE_KEY, weekStart);
                    localStorage.setItem(AUTO_DIGEST_CHECK_KEY, today);

                    // Dispatch custom event so BottomNav updates immediately
                    window.dispatchEvent(new CustomEvent("digest-badge-update"));
                    return;
                }

                // If we get an error (not enough logs, etc.), just mark as checked
                localStorage.setItem(AUTO_DIGEST_CHECK_KEY, today);

            } catch (err) {
                console.error("Auto-digest check failed:", err);
            }
        };

        // Delay 3 seconds to let the app fully load first
        const timer = setTimeout(checkAndGenerate, 3000);
        return () => clearTimeout(timer);

    }, [pathname]);

    return null; // This component renders nothing
}

/**
 * Helper functions for the badge system, used by BottomNav
 */
export function hasUnseenDigest(): boolean {
    try {
        const badgeWeek = localStorage.getItem(DIGEST_BADGE_KEY);
        if (!badgeWeek) return false;

        const now = new Date();
        const currentWeekStart = format(startOfWeek(now, { weekStartsOn: 0 }), "yyyy-MM-dd");

        // Badge is valid only for the current week
        return badgeWeek === currentWeekStart;
    } catch {
        return false;
    }
}

export function clearDigestBadge() {
    try {
        localStorage.removeItem(DIGEST_BADGE_KEY);
        window.dispatchEvent(new CustomEvent("digest-badge-update"));
    } catch { }
}
