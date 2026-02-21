"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, TrendingUp, Calendar, Target, Search } from "lucide-react";
import Link from "next/link";
import Timeline from "@/components/dashboard/Timeline";
import SearchModal from "@/components/dashboard/SearchModal";
import { cn } from "@/lib/utils";

// Types for our data
export interface DailyLog {
    id: string;
    date: string;
    work_score: number;
    personal_score: number;
    transcript: string;
    reflections?: Reflection[];
}

export interface Reflection {
    id: string;
    type: 'work' | 'personal';
    learning: string;
    improvement: string;
    sentiment_tags: string[];
}

export default function DashboardPage() {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('daily_logs')
                .select(`
                    *,
                    reflections (*)
                `)
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .limit(30);

            if (error) {
                console.error("Error fetching logs:", error);
            } else {
                setLogs(data as DailyLog[]);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // Scroll detection
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <main className="min-h-screen bg-mindful-gradient text-amber-100 relative">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-warm-glow opacity-30 pointer-events-none" />
            <div className="fixed top-20 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-breathe-slow pointer-events-none" />

            {/* ═══ FIXED HEADER ═══ */}
            <header className={cn(
                "fixed top-0 left-0 right-0 z-30 bg-mindful-gradient/95 backdrop-blur-md border-b border-white/5 transition-all duration-300 ease-out",
                scrolled ? "py-2.5" : "pt-6 pb-4"
            )}>
                <div className={cn(
                    "max-w-5xl mx-auto px-5 md:px-12 flex items-center transition-all duration-300",
                    scrolled ? "justify-between" : "flex-col items-start gap-4"
                )}>
                    {/* Title Row */}
                    <div className="flex items-center gap-2">
                        <TrendingUp className={cn(
                            "text-emerald-400 shrink-0 transition-all duration-300",
                            scrolled ? "w-5 h-5" : "w-7 h-7"
                        )} />
                        <h1 className={cn(
                            "font-light tracking-wide transition-all duration-300",
                            scrolled ? "text-base" : "text-2xl"
                        )}>
                            Your Journey
                        </h1>
                    </div>

                    {/* Action Buttons */}
                    <div className={cn(
                        "flex gap-2.5 transition-all duration-300",
                        scrolled ? "" : "w-full"
                    )}>
                        <Link
                            href="/digest"
                            className={cn(
                                "bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center transition-all active:scale-95",
                                scrolled
                                    ? "w-9 h-9"
                                    : "flex-1 px-4 py-2.5 gap-2 text-sm"
                            )}
                            title="Weekly Digest"
                        >
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                            {!scrolled && <span>Weekly Digest</span>}
                        </Link>
                        <Link
                            href="/intentions"
                            className={cn(
                                "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 rounded-full flex items-center justify-center transition-all active:scale-95",
                                scrolled
                                    ? "w-9 h-9"
                                    : "flex-1 px-4 py-2.5 gap-2 text-sm"
                            )}
                            title="Set Intentions"
                        >
                            <Target className="w-4 h-4 shrink-0" />
                            {!scrolled && <span>Intentions</span>}
                        </Link>
                        <Link
                            href="/"
                            className={cn(
                                "bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 rounded-full flex items-center justify-center transition-all active:scale-95",
                                scrolled
                                    ? "w-9 h-9"
                                    : "flex-1 px-4 py-2.5 gap-2 text-sm"
                            )}
                            title="Log Today"
                        >
                            <Calendar className="w-4 h-4 shrink-0" />
                            {!scrolled && <span>Log Today</span>}
                        </Link>
                    </div>
                </div>
            </header>

            {/* ═══ SPACER — prevents content hiding behind fixed header ═══ */}
            <div className={cn(
                "transition-all duration-300",
                scrolled ? "h-[52px]" : "h-[140px]"
            )} />

            {/* ═══ TIMELINE CONTENT ═══ */}
            <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-12 pb-24">
                <section>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-amber-200/50">No logs found yet. Start your journey today.</p>
                        </div>
                    ) : (
                        <Timeline logs={logs} />
                    )}
                </section>
            </div>

            {/* ═══ SEARCH FAB ═══ */}
            <button
                onClick={() => setSearchOpen(true)}
                className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:scale-110 transition-all active:scale-95"
                title="Search reflections"
            >
                <Search className="w-5 h-5" />
            </button>

            {/* ═══ SEARCH MODAL ═══ */}
            <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
        </main>
    );
}
