"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Delete, ShieldCheck } from "lucide-react";
import { setPin } from "@/actions/pin";

interface PinSetupScreenProps {
    onComplete: () => void;
}

type Step = "create" | "confirm";

export default function PinSetupScreen({ onComplete }: PinSetupScreenProps) {
    const [step, setStep] = useState<Step>("create");
    const [pin, setPin_] = useState("");
    const [firstPin, setFirstPin] = useState("");
    const [error, setError] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleDigit = useCallback((digit: string) => {
        if (saving) return;
        if (pin.length >= 4) return;

        const newPin = pin + digit;
        setPin_(newPin);
        setError(false);

        if (newPin.length === 4) {
            if (step === "create") {
                // Move to confirm step
                setFirstPin(newPin);
                setTimeout(() => {
                    setStep("confirm");
                    setPin_("");
                }, 300);
            } else {
                // Confirm step — check match
                if (newPin === firstPin) {
                    setSaving(true);
                    setPin(newPin).then(({ success, error: err }) => {
                        if (success) {
                            onComplete();
                        } else {
                            console.error("Failed to save PIN:", err);
                            setSaving(false);
                            setError(true);
                            setPin_("");
                        }
                    });
                } else {
                    // Mismatch — shake and restart
                    setError(true);
                    setTimeout(() => {
                        setStep("create");
                        setFirstPin("");
                        setPin_("");
                        setError(false);
                    }, 600);
                }
            }
        }
    }, [pin, step, firstPin, saving, onComplete]);

    const handleDelete = useCallback(() => {
        if (saving) return;
        setPin_(prev => prev.slice(0, -1));
        setError(false);
    }, [saving]);

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
            <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-40 left-10 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-sm w-full">
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                >
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </motion.div>

                {/* Title */}
                <div className="text-center">
                    <h2 className="text-lg font-light text-amber-100 tracking-wide">
                        {step === "create" ? "Create your PIN" : "Confirm your PIN"}
                    </h2>
                    <p className="text-xs text-amber-200/30 mt-1.5">
                        {step === "create"
                            ? "This PIN will protect your journal"
                            : "Enter the same PIN again"
                        }
                    </p>
                    {error && step === "confirm" && (
                        <p className="text-xs text-red-400/70 mt-2">
                            PINs didn&apos;t match. Let&apos;s try again.
                        </p>
                    )}
                </div>

                {/* Step indicator */}
                <div className="flex gap-2">
                    <div className={`w-8 h-1 rounded-full transition-all ${step === "create" ? "bg-emerald-400" : "bg-emerald-400/30"}`} />
                    <div className={`w-8 h-1 rounded-full transition-all ${step === "confirm" ? "bg-emerald-400" : "bg-white/10"}`} />
                </div>

                {/* Dots */}
                <motion.div
                    className="flex gap-4"
                    animate={error ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    key={step} // Reset animation when step changes
                >
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${i < pin.length
                                    ? error
                                        ? "bg-red-400 border-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
                                        : "bg-emerald-400 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                                    : "border-emerald-500/30 bg-transparent"
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
                                    className="h-16 rounded-2xl flex items-center justify-center text-amber-200/40 hover:text-amber-200/70 hover:bg-white/5 transition-all active:scale-90"
                                >
                                    <Delete className="w-5 h-5" />
                                </button>
                            );
                        }
                        return (
                            <button
                                key={idx}
                                onClick={() => handleDigit(d)}
                                disabled={saving}
                                className="h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-xl font-light text-amber-100 hover:bg-white/[0.08] active:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-30"
                            >
                                {d}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
