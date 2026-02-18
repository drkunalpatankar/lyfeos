"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                router.push("/");
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                setMessage({ type: 'success', text: "Check your email to confirm!" });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-mindful-gradient flex items-center justify-center p-4">
            {/* Ambient background */}
            <div className="fixed inset-0 bg-warm-glow opacity-40 pointer-events-none" />
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[100px] animate-breathe-slow" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 rounded-full blur-[100px] animate-breathe" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-warm rounded-3xl p-8 shadow-2xl backdrop-blur-xl border border-white/10">

                    {/* Header */}
                    <div className="text-center space-y-4 mb-8">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                            <h1 className="text-2xl font-light tracking-wide text-amber-100">LyFeOS</h1>
                        </div>
                        <p className="text-sm text-amber-200/60 font-light">
                            {isLogin ? "Welcome back to your flow" : "Begin your mindful journey"}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex bg-black/20 p-1 rounded-xl mb-8 border border-white/5">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                                isLogin ? "bg-white/10 text-amber-100 shadow-sm" : "text-amber-200/40 hover:text-amber-200/60"
                            )}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={cn(
                                "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                                !isLogin ? "bg-white/10 text-amber-100 shadow-sm" : "text-amber-200/40 hover:text-amber-200/60"
                            )}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-200/40 group-focus-within:text-amber-200/80 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-10 py-3 text-amber-100 placeholder:text-amber-200/20 focus:outline-none focus:bg-black/30 focus:border-amber-400/30 transition-all font-light"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-200/40 group-focus-within:text-amber-200/80 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-10 py-3 text-amber-100 placeholder:text-amber-200/20 focus:outline-none focus:bg-black/30 focus:border-amber-400/30 transition-all font-light"
                                />
                            </div>
                        </div>

                        {/* Messages */}
                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={cn(
                                        "p-3 rounded-lg text-xs text-center font-medium",
                                        message.type === 'error' ? "bg-red-500/10 text-red-200 border border-red-500/20" : "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20"
                                    )}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl font-light flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-rose-900/20"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? "Enter LyFeOS" : "Create Account"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <p className="text-xs text-amber-200/30 font-light">
                        Protected by mindful encryption
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
