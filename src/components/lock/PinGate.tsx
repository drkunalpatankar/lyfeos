"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { checkPinStatus } from "@/actions/pin";
import PinLockScreen from "./PinLockScreen";
import PinSetupScreen from "./PinSetupScreen";

const IDLE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
const EXCLUDED_PATHS = ["/login", "/auth", "/terms", "/privacy"];

interface PinGateProps {
    children: React.ReactNode;
}

export default function PinGate({ children }: PinGateProps) {
    const [state, setState] = useState<"loading" | "locked" | "setup" | "unlocked">("loading");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Skip PIN gate on public pages
    const isExcluded = EXCLUDED_PATHS.some(p => pathname.startsWith(p));

    // Check auth + PIN status on mount
    useEffect(() => {
        if (isExcluded) {
            setState("unlocked");
            return;
        }

        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                setState("unlocked"); // Not logged in — let middleware handle redirect
                return;
            }
            setIsAuthenticated(true);

            checkPinStatus().then(({ hasPin }) => {
                if (hasPin) {
                    setState("locked");
                } else {
                    setState("setup"); // Force PIN setup
                }
            });
        });
    }, [isExcluded]);

    // Visibility change — lock when app is hidden (minimized/switched)
    useEffect(() => {
        if (isExcluded || !isAuthenticated) return;

        const handleVisibility = () => {
            if (document.hidden && state === "unlocked") {
                setState("locked");
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [state, isExcluded, isAuthenticated]);

    // Idle timer — lock after 2 minutes of no interaction
    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            if (state === "unlocked" && isAuthenticated) {
                setState("locked");
            }
        }, IDLE_TIMEOUT_MS);
    }, [state, isAuthenticated]);

    useEffect(() => {
        if (isExcluded || !isAuthenticated || state !== "unlocked") return;

        const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll"];
        events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }));
        resetIdleTimer(); // Start the timer

        return () => {
            events.forEach(e => window.removeEventListener(e, resetIdleTimer));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [resetIdleTimer, isExcluded, isAuthenticated, state]);

    // Handle unlock
    const handleUnlock = () => {
        setState("unlocked");
        resetIdleTimer();
    };

    // Handle forgot PIN (sign out)
    const handleForgot = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        // Clear avatar cache
        try { localStorage.removeItem("lyfeos_avatar"); } catch { }
        router.push("/login");
    };

    // Handle setup complete
    const handleSetupComplete = () => {
        setState("unlocked");
        resetIdleTimer();
    };

    // Loading state — show nothing (brief flash)
    if (state === "loading" && !isExcluded) {
        return (
            <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            </div>
        );
    }

    // PIN setup required
    if (state === "setup") {
        return <PinSetupScreen onComplete={handleSetupComplete} />;
    }

    // Locked
    if (state === "locked") {
        return (
            <>
                <PinLockScreen onUnlock={handleUnlock} onForgot={handleForgot} />
                {/* Render children hidden underneath so they don't lose state */}
                <div className="hidden">{children}</div>
            </>
        );
    }

    // Unlocked — render app normally
    return <>{children}</>;
}
