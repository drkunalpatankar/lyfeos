"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, TrendingUp, Calendar, Target, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Timeline from "@/components/dashboard/Timeline";
import YearGrid from "@/components/dashboard/YearGrid";
import SearchModal from "@/components/dashboard/SearchModal";
import { getMonthCounts, type YearData } from "@/actions/get-month-counts";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

function DashboardContent() {
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [yearData, setYearData] = useState<YearData[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const monthParam = searchParams.get("month"); // e.g. "2026-01" or null

    // Determine which month to display
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    const displayMonth = monthParam || currentYearMonth;
    const isCurrentMonth = displayMonth === currentYearMonth;

    // Friendly label for the month header
    const [displayYear, displayMonthNum] = displayMonth.split("-");
    const monthLabel = format(new Date(parseInt(displayYear), parseInt(displayMonthNum) - 1, 1), "MMMM yyyy");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch logs for the displayed month only
            const startDate = `${displayMonth}-01`;
            const endMonth = parseInt(displayMonthNum);
            const endYear = parseInt(displayYear);
            const nextMonth = endMonth === 12
                ? `${endYear + 1}-01-01`
                : `${endYear}-${(endMonth + 1).toString().padStart(2, "0")}-01`;

            const { data, error } = await supabase
                .from('daily_logs')
                .select(`
                    *,
                    reflections (*)
                `)
                .eq('user_id', user.id)
                .gte('date', startDate)
                .lt('date', nextMonth)
                .order('date', { ascending: false });

            if (error) {
                console.error("Error fetching logs:", error);
            } else {
                setLogs(data as DailyLog[]);
            }

            // Fetch month counts for year grids (only on main view)
            if (isCurrentMonth) {
                const { data: counts } = await getMonthCounts();
                setYearData(counts);
            }

            setLoading(false);
        };

        fetchData();
    }, [displayMonth]);

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
                        {!isCurrentMonth && (
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="mr-1 w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-amber-200/60 hover:text-amber-100 transition-all"
                                title="Back to current month"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}
                        <TrendingUp className={cn(
                            "text-emerald-400 shrink-0 transition-all duration-300",
                            scrolled ? "w-5 h-5" : "w-7 h-7"
                        )} />
                        <h1 className={cn(
                            "font-light tracking-wide transition-all duration-300",
                            scrolled ? "text-base" : "text-2xl"
                        )}>
                            {isCurrentMonth ? "Your Journey" : monthLabel}
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

            {/* ═══ SPACER ═══ */}
            <div className={cn(
                "transition-all duration-300",
                scrolled ? "h-[52px]" : "h-[140px]"
            )} />

            {/* ═══ CONTENT ═══ */}
            <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-12 pb-24">
                <section>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Timeline for the displayed month */}
                            {logs.length > 0 ? (
                                <Timeline logs={logs} />
                            ) : (
                                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5">
                                    <p className="text-amber-200/50">
                                        {isCurrentMonth
                                            ? "No logs found yet. Start your journey today."
                                            : `No entries for ${monthLabel}.`
                                        }
                                    </p>
                                    {!isCurrentMonth && (
                                        <button
                                            onClick={() => router.push("/dashboard")}
                                            className="mt-3 text-sm text-amber-400/60 hover:text-amber-400 transition-colors"
                                        >
                                            ← Back to current month
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Year Grids — only visible on the main (current month) view */}
                            {isCurrentMonth && yearData.length > 0 && (
                                <div className="mt-12 border-t border-amber-500/10 pt-4">
                                    <YearGrid years={yearData} currentMonth={currentYearMonth} />
                                </div>
                            )}
                        </>
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

// Wrap in Suspense for useSearchParams
export default function DashboardPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-mindful-gradient flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </main>
        }>
            <DashboardContent />
        </Suspense>
    );
}
