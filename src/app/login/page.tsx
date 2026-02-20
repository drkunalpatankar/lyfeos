"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
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
                const getAuthCallbackUrl = () => {
                    const origin = window.location.origin;
                    if (origin.includes("www.lyfeos.in")) {
                        return "https://lyfeos.in/auth/callback";
                    }
                    return `${origin}/auth/callback`;
                };

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: getAuthCallbackUrl(),
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

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setMessage(null);
        try {
            const getAuthCallbackUrl = () => {
                const origin = window.location.origin;
                // Supabase strictly expects lyfeos.in, not www.lyfeos.in. 
                // If the user happens to be on www, rewrite the redirect URL to prevent the fallback loop.
                if (origin.includes("www.lyfeos.in")) {
                    return "https://lyfeos.in/auth/callback";
                }
                return `${origin}/auth/callback`;
            };

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: getAuthCallbackUrl(),
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
            setGoogleLoading(false);
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

                    {/* Google Sign-In Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 mb-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/30 rounded-xl text-amber-100 text-sm font-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {googleLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[10px] uppercase tracking-widest text-amber-200/20">or</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {/* Toggle */}
                    <div className="flex bg-black/20 p-1 rounded-xl mb-6 border border-white/5">
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

                <div className="text-center mt-6 space-y-2">
                    <p className="text-xs text-amber-200/30 font-light">
                        Protected by mindful encryption
                    </p>
                    <div className="flex items-center justify-center gap-3 text-[10px] text-amber-200/20">
                        <Link href="/privacy" className="hover:text-amber-200/50 transition-colors">
                            Privacy Policy
                        </Link>
                        <span>·</span>
                        <Link href="/terms" className="hover:text-amber-200/50 transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
