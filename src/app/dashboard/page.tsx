"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import Timeline from "@/components/dashboard/Timeline";
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
    const [isCompact, setIsCompact] = useState(false);
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

    // Scroll-responsive header
    useEffect(() => {
        let lastScrollY = 0;
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsCompact(scrollY > 60);
            lastScrollY = scrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="min-h-screen bg-mindful-gradient text-amber-100 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-warm-glow opacity-30 pointer-events-none" />
            <div className="fixed top-20 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-breathe-slow" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-24">

                {/* Scroll-Responsive Sticky Header */}
                <header className={cn(
                    "sticky top-0 z-20 bg-mindful-gradient/95 backdrop-blur-md -mx-6 px-6 md:-mx-12 md:px-12 border-b border-white/5 transition-all duration-300",
                    isCompact ? "py-3" : "pt-6 pb-4"
                )}>
                    <div className={cn(
                        "flex items-center transition-all duration-300",
                        isCompact ? "justify-between" : "flex-col items-start gap-4"
                    )}>
                        {/* Title */}
                        <div className="flex items-center gap-2">
                            <TrendingUp className={cn(
                                "text-emerald-400 transition-all duration-300",
                                isCompact ? "w-5 h-5" : "w-8 h-8"
                            )} />
                            <h1 className={cn(
                                "font-light tracking-wide transition-all duration-300",
                                isCompact ? "text-lg" : "text-3xl"
                            )}>
                                Your Journey
                            </h1>
                        </div>

                        {/* Subtitle — only in expanded */}
                        {!isCompact && (
                            <p className="text-amber-200/60 font-light text-sm -mt-2">
                                Visualizing your path to high performance
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className={cn(
                            "flex gap-3 transition-all duration-300",
                            isCompact ? "" : "w-full"
                        )}>
                            <Link
                                href="/digest"
                                className={cn(
                                    "bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center transition-all hover:scale-105",
                                    isCompact
                                        ? "w-9 h-9"
                                        : "flex-1 sm:flex-none px-4 py-2.5 gap-2 text-sm"
                                )}
                                title="Weekly Digest"
                            >
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                {!isCompact && <span>Weekly Digest</span>}
                            </Link>

                            <Link
                                href="/"
                                className={cn(
                                    "bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 rounded-full flex items-center justify-center transition-all hover:scale-105",
                                    isCompact
                                        ? "w-9 h-9"
                                        : "flex-1 sm:flex-none px-4 py-2.5 gap-2 text-sm"
                                )}
                                title="Log Today"
                            >
                                <Calendar className="w-4 h-4" />
                                {!isCompact && <span>Log Today</span>}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Timeline Section */}
                <section className="pt-8">
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
        </main>
    );
}
