"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Delete, Lock } from "lucide-react";
import { verifyPin } from "@/actions/pin";

interface PinLockScreenProps {
    onUnlock: () => void;
    onForgot: () => void;
}

export default function PinLockScreen({ onUnlock, onForgot }: PinLockScreenProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [cooldown, setCooldown] = useState(0);
    const [verifying, setVerifying] = useState(false);

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown(c => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleDigit = useCallback((digit: string) => {
        if (cooldown > 0 || verifying) return;
        if (pin.length >= 4) return;

        const newPin = pin + digit;
        setPin(newPin);
        setError(false);

        // Auto-submit when 4 digits entered
        if (newPin.length === 4) {
            setVerifying(true);
            verifyPin(newPin).then(({ valid }) => {
                if (valid) {
                    onUnlock();
                } else {
                    const newAttempts = attempts + 1;
                    setAttempts(newAttempts);
                    setError(true);
                    setPin("");
                    setVerifying(false);

                    if (newAttempts >= 3) {
                        setCooldown(30);
                        setAttempts(0);
                    }
                }
            });
        }
    }, [pin, cooldown, verifying, attempts, onUnlock]);

    const handleDelete = useCallback(() => {
        if (cooldown > 0 || verifying) return;
        setPin(prev => prev.slice(0, -1));
        setError(false);
    }, [cooldown, verifying]);

    // Keyboard support
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (/^\d$/.test(e.key)) handleDigit(e.key);
            if (e.key === "Backspace") handleDelete();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [handleDigit, handleDelete]);

    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-center">
            {/* Ambient glow */}
            <div className="absolute top-20 right-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-40 left-10 w-56 h-56 bg-rose-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-sm w-full">
                {/* Lock Icon */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
                >
                    <Lock className="w-6 h-6 text-amber-400" />
                </motion.div>

                {/* Title */}
                <div className="text-center">
                    <h2 className="text-lg font-light text-amber-100 tracking-wide">Enter your PIN</h2>
                    {cooldown > 0 && (
                        <p className="text-xs text-red-400/70 mt-2">
                            Too many attempts. Try again in {cooldown}s
                        </p>
                    )}
                </div>

                {/* Dots */}
                <motion.div
                    className="flex gap-4"
                    animate={error ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                >
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${i < pin.length
                                    ? error
                                        ? "bg-red-400 border-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
                                        : "bg-amber-400 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                    : "border-amber-500/30 bg-transparent"
                                }`}
                        />
                    ))}
                </motion.div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
                    {digits.map((d, idx) => {
                        if (d === "") return <div key={idx} />;
                        if (d === "del") {
                            return (
                                <button
                                    key={idx}
                                    onClick={handleDelete}
                                    disabled={cooldown > 0}
                                    className="h-16 rounded-2xl flex items-center justify-center text-amber-200/40 hover:text-amber-200/70 hover:bg-white/5 transition-all active:scale-90 disabled:opacity-30"
                                >
                                    <Delete className="w-5 h-5" />
                                </button>
                            );
                        }
                        return (
                            <button
                                key={idx}
                                onClick={() => handleDigit(d)}
                                disabled={cooldown > 0}
                                className="h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-xl font-light text-amber-100 hover:bg-white/[0.08] active:bg-amber-500/20 active:scale-95 transition-all disabled:opacity-30"
                            >
                                {d}
                            </button>
                        );
                    })}
                </div>

                {/* Forgot PIN */}
                <button
                    onClick={onForgot}
                    className="text-xs text-amber-200/25 hover:text-amber-200/50 transition-colors mt-2"
                >
                    Forgot PIN? Sign out to reset
                </button>
            </div>
        </div>
    );
}
