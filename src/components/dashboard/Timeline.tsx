"use client";

import { motion } from "framer-motion";
import { DailyLog } from "@/app/dashboard/page";
import { format, parseISO, isToday } from "date-fns";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface TimelineProps {
    logs: DailyLog[];
}

export default function Timeline({ logs }: TimelineProps) {
    return (
        <Tooltip.Provider delayDuration={200}>
            <div className="relative py-10 space-y-16">

                {/* Central Vertical Line (Gradient) */}
                <div className="absolute left-[80px] md:left-[120px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />

                {logs.map((log, index) => {
                    const date = parseISO(log.date);
                    const editable = isToday(date);

                    // Parse reflections
                    const workRef = log.reflections?.find(r => r.type === 'work');
                    const personalRef = log.reflections?.find(r => r.type === 'personal');

                    return (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start gap-8 md:gap-12 group"
                        >
                            {/* 1. Date Node (Leftward Inclined) */}
                            <div className="relative z-10 w-[80px] md:w-[120px] flex flex-col items-end pt-2 pr-4 text-right">
                                <span className="text-2xl md:text-3xl font-light text-amber-100/90 tracking-tighter">
                                    {format(date, "d")}
                                </span>
                                <span className="text-xs uppercase tracking-widest text-amber-500/60 font-medium">
                                    {format(date, "MMM")}
                                </span>

                                {/* Edit icon — today only */}
                                {editable && (
                                    <Link
                                        href={`/?edit=${log.date}`}
                                        className="mt-2 w-7 h-7 flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:scale-110 transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </Link>
                                )}

                                {/* Connector Dot */}
                                <div className="absolute right-[-5px] top-[18px] w-3 h-3 bg-mindful-dark border-2 border-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] group-hover:scale-125 transition-transform" />
                            </div>

                            {/* 2. Content Tablets (Right Side) */}
                            <div className="flex-1 space-y-4 pt-1">

                                {/* Work Tablet */}
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <div className="glass-warm p-4 rounded-xl border border-white/5 hover:border-blue-400/30 transition-all cursor-default max-w-2xl bg-gradient-to-r from-blue-500/5 to-transparent">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                                    {log.work_score === 3 ? "😓" : log.work_score === 9 ? "🔥" : "⚡"}
                                                </div>
                                                <span className="text-xs font-semibold text-blue-200/70 uppercase tracking-wider">Work Flow</span>

                                                {/* Emotion Chips */}
                                                <div className="flex gap-2 ml-auto">
                                                    {workRef?.sentiment_tags.slice(0, 3).map(tag => (
                                                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300/80 border border-blue-500/20">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-300 line-clamp-2 italic">
                                                &quot;{workRef?.learning || "No reflection logged"}&quot;
                                            </p>
                                        </div>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            className="z-50 max-w-xs bg-gray-900/95 border border-white/10 text-gray-200 text-sm p-4 rounded-lg shadow-xl backdrop-blur-md animate-slidedown"
                                            sideOffset={5}
                                        >
                                            <div className="space-y-2">
                                                <strong className="block text-blue-400 text-xs uppercase">Key Learning</strong>
                                                <p>{workRef?.learning}</p>
                                                {workRef?.improvement && (
                                                    <>
                                                        <strong className="block text-blue-400 text-xs uppercase pt-2 border-t border-white/10 mt-2">Improvement</strong>
                                                        <p>{workRef?.improvement}</p>
                                                    </>
                                                )}
                                            </div>
                                            <Tooltip.Arrow className="fill-gray-900/95" />
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>

                                {/* Personal Tablet */}
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
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
                                            <p className="text-sm text-gray-300 line-clamp-2 italic">
                                                &quot;{personalRef?.learning || "No reflection logged"}&quot;
                                            </p>
                                        </div>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            className="z-50 max-w-xs bg-gray-900/95 border border-white/10 text-gray-200 text-sm p-4 rounded-lg shadow-xl backdrop-blur-md animate-slidedown"
                                            sideOffset={5}
                                        >
                                            <div className="space-y-2">
                                                <strong className="block text-rose-400 text-xs uppercase">Moment</strong>
                                                <p>{personalRef?.learning}</p>
                                                {personalRef?.improvement && (
                                                    <>
                                                        <strong className="block text-rose-400 text-xs uppercase pt-2 border-t border-white/10 mt-2">Improvement</strong>
                                                        <p>{personalRef?.improvement}</p>
                                                    </>
                                                )}
                                            </div>
                                            <Tooltip.Arrow className="fill-gray-900/95" />
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>

                            </div>
                        </motion.div>
                    );
                })}

                {/* End of Line Indicator */}
                <div className="absolute left-[80px] md:left-[120px] bottom-0 w-2 h-2 -ml-[3px] bg-amber-500/30 rounded-full" />
            </div>
        </Tooltip.Provider>
    );
}
