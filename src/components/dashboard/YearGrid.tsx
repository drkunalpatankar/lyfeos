"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type YearData } from "@/actions/get-month-counts";
import { useRouter } from "next/navigation";

interface YearGridProps {
    years: YearData[];
    currentMonth: string; // "2026-02" — the currently displayed month (to highlight it)
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function YearGrid({ years, currentMonth }: YearGridProps) {
    const router = useRouter();
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;

    const handleMonthTap = (monthKey: string, count: number) => {
        if (count === 0) return; // Don't navigate to empty months
        router.push(`/dashboard?month=${monthKey}`);
    };

    return (
        <div className="space-y-8 py-6">
            {years.map((yearData, yearIdx) => (
                <motion.div
                    key={yearData.year}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: yearIdx * 0.1 }}
                >
                    {/* Year Header */}
                    <h3 className="text-center text-2xl font-extralight text-amber-100/40 tracking-[0.3em] uppercase mb-5">
                        {yearData.year}
                    </h3>

                    {/* Month Grid: 3×4 on mobile, 4×3 on desktop */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5 px-2">
                        {yearData.months.map((monthData, idx) => {
                            const isFuture = monthData.month > currentYearMonth;
                            const isActive = monthData.month === currentMonth;
                            const hasEntries = monthData.count > 0;

                            if (isFuture) {
                                return (
                                    <div
                                        key={monthData.month}
                                        className="aspect-[4/3] rounded-xl border border-white/[0.03] bg-white/[0.01] flex flex-col items-center justify-center opacity-30"
                                    >
                                        <span className="text-[10px] uppercase tracking-widest text-amber-200/20 font-medium">
                                            {MONTH_LABELS[idx]}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={monthData.month}
                                    onClick={() => handleMonthTap(monthData.month, monthData.count)}
                                    disabled={!hasEntries}
                                    className={cn(
                                        "aspect-[4/3] rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-200",
                                        hasEntries
                                            ? "glass-warm border-amber-500/15 hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:scale-[1.03] cursor-pointer active:scale-95"
                                            : "border-white/[0.05] bg-white/[0.02] cursor-default",
                                        isActive && "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20"
                                    )}
                                >
                                    <span className={cn(
                                        "text-[11px] uppercase tracking-widest font-medium",
                                        hasEntries ? "text-amber-200/70" : "text-amber-200/20"
                                    )}>
                                        {MONTH_LABELS[idx]}
                                    </span>
                                    <span className={cn(
                                        "text-lg font-light tabular-nums",
                                        hasEntries ? "text-amber-400" : "text-white/10"
                                    )}>
                                        {hasEntries ? monthData.count : "—"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
