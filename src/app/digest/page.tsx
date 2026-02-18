"use client";

import { useState, useEffect } from "react";
import { generateWeeklyDigest, type WeeklyReport } from "@/actions/generate-digest";
import {
    ArrowLeft, Loader2, AlertTriangle, Target, Brain,
    TrendingUp, ChevronRight, Zap
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// ─── Donut Chart Component (Pure SVG) ────────────────────────────
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) return null;

    const radius = 80;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;
    let accumulated = 0;

    return (
        <div className="relative w-52 h-52 mx-auto">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {data.map((segment, i) => {
                    const percentage = segment.value / total;
                    const dashLength = circumference * percentage;
                    const dashOffset = circumference * accumulated;
                    accumulated += percentage;
                    return (
                        <circle
                            key={i}
                            cx="100" cy="100" r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                            strokeDashoffset={-dashOffset}
                            strokeLinecap="round"
                            className="transition-all duration-700"
                        />
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-light text-amber-100">{total.toFixed(0)}h</span>
                <span className="text-[10px] text-amber-200/50 uppercase tracking-widest">Total</span>
            </div>
        </div>
    );
}

// ─── Life Balance Gauge (SVG Arc) ────────────────────────────────
function BalanceGauge({ score }: { score: number }) {
    const clampedScore = Math.max(0, Math.min(100, score));
    const radius = 90;
    const strokeWidth = 10;
    const circumference = Math.PI * radius; // half circle
    const progress = (clampedScore / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 75) return "#34d399"; // emerald
        if (s >= 50) return "#fbbf24"; // amber
        return "#f87171"; // red
    };

    return (
        <div className="relative w-56 h-32 mx-auto">
            <svg viewBox="0 0 200 110" className="w-full h-full">
                {/* Background arc */}
                <path
                    d="M 10 100 A 90 90 0 0 1 190 100"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                    d="M 10 100 A 90 90 0 0 1 190 100"
                    fill="none"
                    stroke={getColor(clampedScore)}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${progress} ${circumference}`}
                    className="transition-all duration-1000"
                />
            </svg>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl font-light"
                    style={{ color: getColor(clampedScore) }}
                >
                    {clampedScore}
                </motion.span>
                <span className="text-amber-200/40 text-lg">/100</span>
            </div>
        </div>
    );
}

// ─── Emotion Heat Dot ────────────────────────────────────────────
function EmotionDot({ emotion, type }: { emotion: string; type: "work" | "personal" }) {
    const stressWords = ["stressed", "overwhelmed", "anxious", "drained", "frustrated", "burned"];
    const calmWords = ["calm", "peaceful", "focused", "productive", "grateful", "connected"];

    const lower = emotion.toLowerCase();
    let color = "bg-gray-400"; // neutral
    if (stressWords.some(w => lower.includes(w))) color = type === "work" ? "bg-amber-500" : "bg-rose-500";
    if (calmWords.some(w => lower.includes(w))) color = type === "work" ? "bg-blue-400" : "bg-emerald-400";

    return (
        <div className="group relative">
            <div className={cn("w-4 h-4 rounded-full transition-transform hover:scale-150 cursor-default", color)} />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {emotion}
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function DigestPage() {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<WeeklyReport | null>(null);
    const [timeData, setTimeData] = useState<any>(null);
    const [weekRange, setWeekRange] = useState("");
    const [error, setError] = useState("");

    const handleGenerate = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await generateWeeklyDigest();
            if (result.error) {
                setError(result.error);
            } else {
                setReport(result.report as WeeklyReport);
                setTimeData(result.time_data);
                setWeekRange(result.week_range || "");
            }
        } catch (e) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Load most recent report on mount
    useEffect(() => {
        const fetchLatest = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("weekly_reports")
                .select("metrics_json, week_start_date, week_end_date")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            if (data?.metrics_json) {
                setReport(data.metrics_json as WeeklyReport);
                setWeekRange(`${data.week_start_date} to ${data.week_end_date}`);
            }
        };
        fetchLatest();
    }, []);

    return (
        <main className="min-h-screen bg-mindful-gradient text-amber-100 relative overflow-hidden">
            <div className="fixed inset-0 bg-warm-glow opacity-20 pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <Link href="/dashboard" className="text-amber-200/60 hover:text-amber-100 transition-colors flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Timeline</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-amber-400" />
                        <span className="text-sm uppercase tracking-widest text-amber-200/60 font-medium">Intelligence</span>
                    </div>
                </header>

                {/* ─── ZERO STATE ─── */}
                {!report && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 space-y-8 text-center">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                            <Brain className="w-10 h-10 text-amber-400" />
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-light">Weekly Intelligence</h1>
                            <p className="text-amber-200/50 max-w-sm mx-auto leading-relaxed text-sm">
                                Analyze your behavioral data. Surface patterns. Identify blind spots.
                            </p>
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-full font-medium tracking-wide shadow-lg hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                        >
                            <Zap className="w-4 h-4" />
                            Generate Report
                        </button>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </motion.div>
                )}

                {/* ─── LOADING STATE ─── */}
                {loading && (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-amber-500/20 rounded-full animate-ping absolute inset-0" />
                            <Brain className="w-16 h-16 text-amber-400 animate-pulse relative z-10" />
                        </div>
                        <p className="text-amber-200/80 animate-pulse text-sm tracking-widest uppercase">Analyzing behavioral patterns...</p>
                    </div>
                )}

                {/* ─── REPORT VIEW ─── */}
                {report && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                        {/* Week Range + Regenerate */}
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-200/40 uppercase tracking-widest">{weekRange}</span>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                <Zap className="w-3 h-3" />
                                Regenerate
                            </button>
                        </div>

                        {/* ─── 1. LIFE BALANCE SCORE ─── */}
                        <section className="glass-warm rounded-3xl p-8 border border-white/5 text-center">
                            <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-bold mb-6">Life Balance Index</h2>
                            <BalanceGauge score={report.life_balance_index} />
                            <p className="text-sm text-amber-200/60 mt-4 max-w-xs mx-auto">
                                {report.time_analysis.insight}
                            </p>
                        </section>

                        {/* ─── 2. TIME DISTRIBUTION ─── */}
                        {timeData && (
                            <section className="glass-warm rounded-3xl p-8 border border-white/5">
                                <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-bold mb-6">Time Distribution</h2>
                                <DonutChart data={[
                                    { label: "Work", value: timeData.total_work_hours, color: "#60a5fa" },
                                    { label: "Personal", value: timeData.total_personal_hours, color: "#f472b6" },
                                    { label: "Health", value: timeData.total_health_hours, color: "#34d399" },
                                    { label: "Sleep", value: timeData.total_sleep_hours, color: "#a78bfa" },
                                ]} />
                                <div className="flex justify-center gap-6 mt-6">
                                    {[
                                        { label: "Work", color: "bg-blue-400", value: timeData.total_work_hours },
                                        { label: "Personal", color: "bg-pink-400", value: timeData.total_personal_hours },
                                        { label: "Health", color: "bg-emerald-400", value: timeData.total_health_hours },
                                        { label: "Sleep", color: "bg-violet-400", value: timeData.total_sleep_hours },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-2 text-xs text-amber-200/60">
                                            <div className={cn("w-2 h-2 rounded-full", item.color)} />
                                            <span>{item.label} {item.value}h</span>
                                        </div>
                                    ))}
                                </div>
                                {report.time_analysis.imbalance_flag && (
                                    <p className="text-xs text-amber-400 mt-4 text-center">
                                        ⚠ Work allocation at {report.time_analysis.work_percentage}%
                                    </p>
                                )}
                            </section>
                        )}

                        {/* ─── 3. EMOTIONAL HEAT STRIP ─── */}
                        <section className="glass-warm rounded-3xl p-6 border border-white/5 space-y-4">
                            <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-bold">Emotional Landscape</h2>

                            <div className="space-y-3">
                                <div>
                                    <span className="text-[10px] text-blue-300/70 uppercase tracking-widest">Work — {report.emotional_trends.dominant_work_emotion}</span>
                                    <div className="flex gap-2 mt-2">
                                        <EmotionDot emotion={report.emotional_trends.dominant_work_emotion} type="work" />
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-rose-300/70 uppercase tracking-widest">Personal — {report.emotional_trends.dominant_personal_emotion}</span>
                                    <div className="flex gap-2 mt-2">
                                        <EmotionDot emotion={report.emotional_trends.dominant_personal_emotion} type="personal" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="text-[10px] text-amber-200/40 uppercase tracking-widest">Volatility Index</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${report.emotional_trends.volatility_index}%`,
                                                backgroundColor: report.emotional_trends.volatility_index > 60 ? '#f87171' : report.emotional_trends.volatility_index > 35 ? '#fbbf24' : '#34d399'
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-amber-100 font-mono">{report.emotional_trends.volatility_index}</span>
                                </div>
                            </div>
                            <p className="text-xs text-amber-200/50 italic">{report.emotional_trends.insight}</p>
                        </section>

                        {/* ─── 4. PATTERN INSIGHT CARDS ─── */}
                        {report.pattern_insights.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-bold px-1">Pattern Intelligence</h2>
                                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 scrollbar-none">
                                    {report.pattern_insights.map((insight, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="glass-warm rounded-2xl p-5 border border-white/5 min-w-[280px] snap-start flex-shrink-0"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-[10px] text-amber-400 font-bold">{i + 1}</span>
                                                </div>
                                                <p className="text-sm text-amber-100/90 leading-relaxed">{insight}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ─── 5. LEARNING THEME CLUSTERS ─── */}
                        {report.learning_clusters.length > 0 && (
                            <section className="glass-warm rounded-3xl p-6 border border-white/5">
                                <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-bold mb-4">Learning Themes</h2>
                                <div className="flex flex-wrap gap-3">
                                    {report.learning_clusters.map((cluster, i) => (
                                        <div key={i} className="group relative">
                                            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 cursor-default transition-colors">
                                                <span className="text-sm text-amber-100">{cluster.theme}</span>
                                                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-mono">{cluster.frequency}</span>
                                            </div>
                                            <div className="absolute top-full mt-2 left-0 bg-gray-900/95 border border-white/10 text-gray-200 text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-xs shadow-xl pointer-events-none">
                                                {cluster.implication}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ─── 6. RISK FLAGS ─── */}
                        {report.risk_flags.length > 0 && (
                            <section className="rounded-3xl p-6 border border-amber-500/20 bg-amber-500/5">
                                <h2 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Risk Indicators
                                </h2>
                                <ul className="space-y-3">
                                    {report.risk_flags.map((flag, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-amber-200/80">
                                            <span className="text-amber-500 mt-0.5">⚠</span>
                                            {flag}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* ─── 7. RECOMMENDATIONS ─── */}
                        <section className="glass-warm rounded-3xl p-6 border border-white/5">
                            <h2 className="text-xs uppercase tracking-widest text-emerald-300/60 font-bold mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-400" />
                                Recommendations
                            </h2>
                            <ul className="space-y-3">
                                {report.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-amber-100/90">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <ChevronRight className="w-3 h-3 text-emerald-400" />
                                        </div>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* ─── 8. EXECUTIVE SUMMARY ─── */}
                        <section className="glass-warm rounded-3xl p-8 border border-white/5">
                            <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-bold mb-4">Executive Summary</h2>
                            <p className="text-sm text-amber-100/80 leading-relaxed font-light">
                                {report.executive_summary}
                            </p>
                        </section>

                        {/* Footer */}
                        <p className="text-center text-[10px] text-amber-200/30 uppercase tracking-widest pb-8">
                            LifeOS Intelligence Engine • Powered by Gemini
                        </p>
                    </motion.div>
                )}
            </div>
        </main>
    );
}
