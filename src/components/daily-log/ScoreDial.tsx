"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreDialProps {
    label: string;
    initialValue?: number;
    colorClass?: string;
    onChange: (value: number) => void;
}

export default function ScoreDial({
    label,
    initialValue = 5,
    colorClass = "text-primary",
    onChange,
}: ScoreDialProps) {
    const [value, setValue] = useState(initialValue);

    const handleSelect = (num: number) => {
        setValue(num);
        onChange(num);
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <h3 className="text-sm font-light uppercase tracking-widest text-amber-100/80">
                {label}
            </h3>

            <div className="grid grid-cols-5 gap-2.5 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <motion.button
                        key={num}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(num)}
                        className={cn(
                            "h-11 w-11 rounded-full flex items-center justify-center text-sm font-light transition-all duration-300",
                            value === num
                                ? cn(
                                    "shadow-lg shadow-amber-500/25 scale-110",
                                    colorClass.includes('blue')
                                        ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white"
                                        : "bg-gradient-to-br from-rose-400 to-rose-500 text-white"
                                )
                                : "bg-white/5 text-amber-100/40 hover:bg-white/10 hover:text-amber-100/70"
                        )}
                    >
                        {num}
                    </motion.button>
                ))}
            </div>

            <div className="text-2xl font-light text-amber-100 tracking-wide">
                {value}<span className="text-sm text-amber-200/40">/10</span>
            </div>
        </div>
    );
}
