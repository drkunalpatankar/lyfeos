"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface VibeSelectorProps {
    type: "work" | "personal";
    value: number;
    onChange: (value: number) => void;
}

const vibes = {
    work: [
        { score: 3, emoji: "😓", label: "Tough Day", color: "from-red-500/20 to-red-600/20", border: "border-red-500/40", text: "text-red-300" },
        { score: 6, emoji: "⚡", label: "Steady", color: "from-amber-500/20 to-yellow-600/20", border: "border-amber-500/40", text: "text-amber-300" },
        { score: 9, emoji: "🔥", label: "Crushing It", color: "from-emerald-500/20 to-green-600/20", border: "border-emerald-500/40", text: "text-emerald-300" },
    ],
    personal: [
        { score: 3, emoji: "😔", label: "Draining", color: "from-red-500/20 to-red-600/20", border: "border-red-500/40", text: "text-red-300" },
        { score: 6, emoji: "☁️", label: "Okay", color: "from-amber-500/20 to-yellow-600/20", border: "border-amber-500/40", text: "text-amber-300" },
        { score: 9, emoji: "✨", label: "Fulfilling", color: "from-emerald-500/20 to-green-600/20", border: "border-emerald-500/40", text: "text-emerald-300" },
    ],
};

export default function VibeSelector({ type, value, onChange }: VibeSelectorProps) {
    const options = vibes[type];

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-200/40">
                How was it?
            </h3>
            <div className="grid grid-cols-3 gap-3">
                {options.map((vibe) => {
                    const isSelected = value === vibe.score;
                    return (
                        <motion.button
                            key={vibe.score}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => onChange(vibe.score)}
                            className={cn(
                                "flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all duration-300",
                                isSelected
                                    ? cn("bg-gradient-to-b", vibe.color, vibe.border, "shadow-lg scale-[1.02]")
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                        >
                            <span className={cn(
                                "text-2xl transition-transform duration-300",
                                isSelected && "scale-125"
                            )}>
                                {vibe.emoji}
                            </span>
                            <span className={cn(
                                "text-xs font-medium tracking-wide transition-colors",
                                isSelected ? vibe.text : "text-amber-200/50"
                            )}>
                                {vibe.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
