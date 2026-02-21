"use client";

import { motion } from "framer-motion";
import { DailyLog } from "@/app/dashboard/page";
import { format, parseISO, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface TimelineProps {
    logs: DailyLog[];
}

export default function Timeline({ logs }: TimelineProps) {
    return (
        <div className="relative py-10 space-y-10 md:space-y-16">

            {/* Vertical Timeline Line */}
            <div className="absolute left-4 md:left-[120px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />

            {logs.map((log, index) => {
                const date = parseISO(log.date);
                const editable = isToday(date);

                const workRef = log.reflections?.find(r => r.type === 'work');
                const personalRef = log.reflections?.find(r => r.type === 'personal');

                return (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                    >
                        {/* ===== MOBILE LAYOUT (< md): Stacked, full text ===== */}
                        <div className="md:hidden">
                            {/* Date Row */}
                            <div className="relative flex items-center gap-3 pl-8 mb-3">
                                <div className="absolute left-[11px] w-3 h-3 bg-mindful-dark border-2 border-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                <span className="text-2xl font-light text-amber-100/90 tracking-tighter">
                                    {format(date, "d")}
                                </span>
                                <span className="text-xs uppercase tracking-widest text-amber-500/60 font-medium">
                                    {format(date, "MMM")}
                                </span>
                                {editable && (
                                    <Link
                                        href={`/?edit=${log.date}`}
                                        className="ml-auto mr-2 w-7 h-7 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:scale-110 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>

                            {/* Content Cards — full width, NO truncation */}
                            <div className="pl-8 space-y-3">
                                {/* Work Card */}
                                <div className="glass-warm p-4 rounded-xl border border-white/5 bg-gradient-to-r from-blue-500/5 to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                            {log.work_score === 3 ? "😓" : log.work_score === 9 ? "🔥" : "⚡"}
                                        </div>
                                        <span className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">Work Flow</span>
                                        <div className="flex gap-1.5 ml-auto flex-wrap justify-end">
                                            {workRef?.sentiment_tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300/80 border border-blue-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 italic leading-relaxed">
                                        &quot;{workRef?.learning || "No reflection logged"}&quot;
                                    </p>
                                    {workRef?.improvement && (
                                        <p className="text-xs text-blue-300/50 mt-2 pt-2 border-t border-white/5 leading-relaxed">
                                            <span className="text-blue-400/60 font-semibold uppercase text-[10px] tracking-wider">Improve: </span>
                                            {workRef.improvement}
                                        </p>
                                    )}
                                </div>

                                {/* Personal Card */}
                                <div className="glass-warm p-4 rounded-xl border border-white/5 bg-gradient-to-r from-rose-500/5 to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-xl shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                                            {log.personal_score === 3 ? "😔" : log.personal_score === 9 ? "✨" : "☁️"}
                                        </div>
                                        <span className="text-xs font-semibold text-rose-200/70 uppercase tracking-wider">Life Balance</span>
                                        <div className="flex gap-1.5 ml-auto flex-wrap justify-end">
                                            {personalRef?.sentiment_tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300/80 border border-rose-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 italic leading-relaxed">
                                        &quot;{personalRef?.learning || "No reflection logged"}&quot;
                                    </p>
                                    {personalRef?.improvement && (
                                        <p className="text-xs text-rose-300/50 mt-2 pt-2 border-t border-white/5 leading-relaxed">
                                            <span className="text-rose-400/60 font-semibold uppercase text-[10px] tracking-wider">Improve: </span>
                                            {personalRef.improvement}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ===== DESKTOP LAYOUT (md+): Side-by-side, full text ===== */}
                        <div className="hidden md:flex items-start gap-12">
                            {/* Date Node */}
                            <div className="relative z-10 w-[120px] flex flex-col items-end pt-2 pr-4 text-right">
                                <span className="text-3xl font-light text-amber-100/90 tracking-tighter">
                                    {format(date, "d")}
                                </span>
                                <span className="text-xs uppercase tracking-widest text-amber-500/60 font-medium">
                                    {format(date, "MMM")}
                                </span>
                                {editable && (
                                    <Link
                                        href={`/?edit=${log.date}`}
                                        className="mt-2 w-7 h-7 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:scale-110 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </Link>
                                )}
                                <div className="absolute right-[-5px] top-[18px] w-3 h-3 bg-mindful-dark border-2 border-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] group-hover:scale-125 transition-transform" />
                            </div>

                            {/* Content Cards — full text, no tooltips needed */}
                            <div className="flex-1 space-y-4 pt-1">
                                {/* Work Card */}
                                <div className="glass-warm p-4 rounded-xl border border-white/5 hover:border-blue-400/30 transition-all cursor-default max-w-2xl bg-gradient-to-r from-blue-500/5 to-transparent">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                            {log.work_score === 3 ? "😓" : log.work_score === 9 ? "🔥" : "⚡"}
                                        </div>
                                        <span className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">Work Flow</span>
                                        <div className="flex gap-2 ml-auto">
                                            {workRef?.sentiment_tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300/80 border border-blue-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 italic leading-relaxed">
                                        &quot;{workRef?.learning || "No reflection logged"}&quot;
                                    </p>
                                    {workRef?.improvement && (
                                        <p className="text-xs text-blue-300/50 mt-2 pt-2 border-t border-white/5 leading-relaxed">
                                            <span className="text-blue-400/60 font-semibold uppercase text-[10px] tracking-wider">Improve: </span>
                                            {workRef.improvement}
                                        </p>
                                    )}
                                </div>

                                {/* Personal Card */}
                                <div className="glass-warm p-4 rounded-xl border border-white/5 hover:border-rose-400/30 transition-all cursor-default max-w-2xl bg-gradient-to-r from-rose-500/5 to-transparent">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                                            {log.personal_score === 3 ? "😔" : log.personal_score === 9 ? "✨" : "☁️"}
                                        </div>
                                        <span className="text-xs font-semibold text-rose-200/70 uppercase tracking-wider">Life Balance</span>
                                        <div className="flex gap-2 ml-auto">
                                            {personalRef?.sentiment_tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300/80 border border-rose-500/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 italic leading-relaxed">
                                        &quot;{personalRef?.learning || "No reflection logged"}&quot;
                                    </p>
                                    {personalRef?.improvement && (
                                        <p className="text-xs text-rose-300/50 mt-2 pt-2 border-t border-white/5 leading-relaxed">
                                            <span className="text-rose-400/60 font-semibold uppercase text-[10px] tracking-wider">Improve: </span>
                                            {personalRef.improvement}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </motion.div>
                );
            })}

            {/* End of Line Indicator */}
            <div className="absolute left-4 md:left-[120px] bottom-0 w-2 h-2 -ml-[3px] bg-amber-500/30 rounded-full" />
        </div>
    );
}
