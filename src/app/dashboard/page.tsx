"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { LineChart, Sparkles, TrendingUp, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import Timeline from "@/components/dashboard/Timeline";

// Types for our data
export interface DailyLog {
    id: string;
    date: string;
    work_score: number;
    personal_score: number;
    transcript: string; // We might need to parse this if we stored it as raw text
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
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch logs with reflections
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

    return (
        <main className="min-h-screen bg-mindful-gradient text-amber-100 p-6 md:p-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 bg-warm-glow opacity-30 pointer-events-none" />
            <div className="fixed top-20 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-breathe-slow" />

            <div className="relative z-10 max-w-5xl mx-auto space-y-12">

                {/* Sticky Header */}
                <header className="sticky top-0 z-20 bg-mindful-gradient/95 backdrop-blur-md pb-4 -mx-6 px-6 md:-mx-12 md:px-12 pt-2 border-b border-white/5">
                    <h1 className="text-3xl font-light tracking-wide flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-emerald-400" />
                        Your Journey
                    </h1>
                    <p className="text-amber-200/60 mt-1 font-light text-sm">
                        Visualizing your path to high performance
                    </p>

                    <div className="flex gap-3 mt-4">
                        <Link
                            href="/digest"
                            className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all hover:scale-105 text-sm"
                        >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            Weekly Digest
                        </Link>

                        <Link
                            href="/"
                            className="flex-1 sm:flex-none bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 px-4 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all hover:scale-105 text-sm"
                        >
                            <Calendar className="w-4 h-4" />
                            Log Today
                        </Link>
                    </div>
                </header>

                {/* Timeline Section */}
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
        </main>
    );
}
