"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, X, Mic, MicOff, Loader2, Briefcase, Heart } from "lucide-react";
import { getWeeklyIntentions, addIntention, deleteIntention, type Intention } from "@/actions/intentions";
import VoiceToTextButton from "@/components/daily-log/VoiceToTextButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { startOfWeek, endOfWeek, format } from "date-fns";

export default function IntentionsPage() {
    const [intentions, setIntentions] = useState<Intention[]>([]);
    const [loading, setLoading] = useState(true);
    const [newText, setNewText] = useState("");
    const [category, setCategory] = useState<"work" | "personal">("work");
    const [adding, setAdding] = useState(false);

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
    const weekLabel = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`;

    useEffect(() => {
        loadIntentions();
    }, []);

    const loadIntentions = async () => {
        const result = await getWeeklyIntentions();
        if (result.intentions) setIntentions(result.intentions);
        setLoading(false);
    };

    const handleAdd = async () => {
        const text = newText.trim();
        if (!text) return;

        setAdding(true);
        const result = await addIntention({ text, category });
        if (result.error) {
            toast.error(result.error);
        } else if (result.intention) {
            setIntentions(prev => [...prev, result.intention!]);
            setNewText("");
            toast.success("Intention set ✨");
        }
        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        const result = await deleteIntention(id);
        if (result.error) {
            toast.error(result.error);
        } else {
            setIntentions(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleVoiceTranscript = (text: string) => {
        setNewText(prev => (prev ? prev + " " + text : text));
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case "achieved": return { label: "✅ Achieved", cls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
            case "partial": return { label: "⚠️ Partial", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
            case "missed": return { label: "❌ Missed", cls: "bg-red-500/20 text-red-300 border-red-500/30" };
            default: return { label: "⏳ Pending", cls: "bg-white/5 text-amber-200/50 border-white/10" };
        }
    };

    const workIntentions = intentions.filter(i => i.category === "work");
    const personalIntentions = intentions.filter(i => i.category === "personal");
    const canAdd = intentions.length < 5;

    return (
        <main className="min-h-screen bg-mindful-gradient text-amber-100 relative">
            <div className="fixed inset-0 bg-warm-glow opacity-30 pointer-events-none" />
            <div className="fixed bottom-40 left-10 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl animate-breathe-slow pointer-events-none" />

            <div className="relative z-10 max-w-lg mx-auto px-5 pt-8 pb-28">

                {/* Header */}
                <header className="text-center space-y-3 mb-8">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-emerald-500/20">
                        <Target className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-light tracking-wide">This Week&apos;s Intentions</h1>
                    <p className="text-xs text-amber-200/40 uppercase tracking-widest">{weekLabel}</p>
                    <p className="text-sm text-amber-200/50 font-light max-w-xs mx-auto">
                        Set 3–5 commitments. Not tasks — intentions. The AI evaluates them against your daily reflections.
                    </p>
                </header>

                {/* ─── ADD FORM ─── */}
                {canAdd && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-warm rounded-2xl p-5 border border-white/5 mb-8 space-y-4"
                    >
                        {/* Category Toggle */}
                        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setCategory("work")}
                                className={cn(
                                    "flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
                                    category === "work"
                                        ? "bg-blue-500/15 text-blue-300 border border-blue-500/20"
                                        : "text-amber-200/40 border border-transparent hover:text-amber-200/60"
                                )}
                            >
                                <Briefcase className="w-3.5 h-3.5" /> Work
                            </button>
                            <button
                                onClick={() => setCategory("personal")}
                                className={cn(
                                    "flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5",
                                    category === "personal"
                                        ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                                        : "text-amber-200/40 border border-transparent hover:text-amber-200/60"
                                )}
                            >
                                <Heart className="w-3.5 h-3.5" /> Personal
                            </button>
                        </div>

                        {/* Input Row */}
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 space-y-1">
                                <textarea
                                    value={newText}
                                    onChange={(e) => setNewText(e.target.value)}
                                    placeholder="e.g. Ship the invoice feature..."
                                    className="w-full h-20 px-4 py-3 bg-black/20 border border-amber-200/10 rounded-xl text-amber-100 placeholder:text-amber-200/25 focus:outline-none focus:border-amber-400/40 resize-none text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAdd();
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <VoiceToTextButton onTranscript={handleVoiceTranscript} />
                                <button
                                    onClick={handleAdd}
                                    disabled={!newText.trim() || adding}
                                    className="w-8 h-8 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                                >
                                    {adding ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <p className="text-[10px] text-amber-200/30 text-center">
                            {intentions.length}/5 intentions set
                        </p>
                    </motion.div>
                )}

                {/* Max reached */}
                {!canAdd && (
                    <div className="text-center py-3 px-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mb-8">
                        <p className="text-xs text-emerald-300/70">5/5 intentions set. Focus is power. 🎯</p>
                    </div>
                )}

                {/* ─── INTENTIONS LIST ─── */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                ) : intentions.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-amber-200/40 text-sm">No intentions yet. What will you commit to this week?</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Work Intentions */}
                        {workIntentions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] uppercase tracking-widest text-blue-300/50 font-semibold flex items-center gap-1.5 px-1">
                                    <Briefcase className="w-3 h-3" /> Work
                                </h3>
                                <AnimatePresence mode="popLayout">
                                    {workIntentions.map((item) => {
                                        const badge = statusBadge(item.status);
                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="glass-warm rounded-xl p-4 border border-white/5 flex items-start gap-3 group bg-gradient-to-r from-blue-500/3 to-transparent"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-blue-400/50 mt-1.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-amber-100/90 leading-relaxed">{item.text}</p>
                                                    <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded-full border mt-2", badge.cls)}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                {item.status === "pending" && (
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-amber-200/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Personal Intentions */}
                        {personalIntentions.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-[10px] uppercase tracking-widest text-rose-300/50 font-semibold flex items-center gap-1.5 px-1">
                                    <Heart className="w-3 h-3" /> Personal
                                </h3>
                                <AnimatePresence mode="popLayout">
                                    {personalIntentions.map((item) => {
                                        const badge = statusBadge(item.status);
                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="glass-warm rounded-xl p-4 border border-white/5 flex items-start gap-3 group bg-gradient-to-r from-rose-500/3 to-transparent"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-rose-400/50 mt-1.5 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-amber-100/90 leading-relaxed">{item.text}</p>
                                                    <span className={cn("inline-block text-[10px] px-2 py-0.5 rounded-full border mt-2", badge.cls)}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                {item.status === "pending" && (
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-amber-200/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-[10px] text-amber-200/25 mt-12 uppercase tracking-widest">
                    Set on Sunday • Evaluated on Sunday
                </p>
            </div>
        </main>
    );
}
