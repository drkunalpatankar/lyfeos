"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmotionChip {
    id: string;
    label: string;
    emoji: string;
}

interface EmotionChipSelectorProps {
    type: "work" | "personal";
    selected: string[];
    onChange: (emotions: string[]) => void;
}

const WORK_EMOTIONS: EmotionChip[] = [
    { id: "productive", label: "Productive", emoji: "💼" },
    { id: "stressed", label: "Stressed", emoji: "😰" },
    { id: "focused", label: "Focused", emoji: "🎯" },
    { id: "overwhelmed", label: "Overwhelmed", emoji: "😵" },
    { id: "energized", label: "Energized", emoji: "⚡" },
    { id: "drained", label: "Drained", emoji: "🔋" },
];

const PERSONAL_EMOTIONS: EmotionChip[] = [
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "peaceful", label: "Peaceful", emoji: "🕊️" },
    { id: "frustrated", label: "Frustrated", emoji: "😤" },
    { id: "connected", label: "Connected", emoji: "🤝" },
    { id: "lonely", label: "Lonely", emoji: "😔" },
    { id: "fulfilled", label: "Fulfilled", emoji: "✨" },
];

export default function EmotionChipSelector({
    type,
    selected,
    onChange,
}: EmotionChipSelectorProps) {
    const emotions = type === "work" ? WORK_EMOTIONS : PERSONAL_EMOTIONS;

    const toggleEmotion = (emotionId: string) => {
        if (selected.includes(emotionId)) {
            onChange(selected.filter((id) => id !== emotionId));
        } else {
            onChange([...selected, emotionId]);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm font-light text-amber-200/70">
                How did you feel? (Select all that apply)
            </p>
            <div className="grid grid-cols-2 gap-3">
                {emotions.map((emotion) => {
                    const isSelected = selected.includes(emotion.id);
                    return (
                        <motion.button
                            key={emotion.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleEmotion(emotion.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200",
                                isSelected
                                    ? "bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/40 shadow-lg"
                                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                            )}
                        >
                            <span className="text-xl">{emotion.emoji}</span>
                            <span className={cn(
                                "text-sm font-light",
                                isSelected ? "text-amber-100" : "text-amber-200/60"
                            )}>
                                {emotion.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
