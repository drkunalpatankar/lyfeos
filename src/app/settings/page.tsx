"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe, Stethoscope, Check, LogOut, Trash2, ArrowLeft, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { deleteAccount } from "@/actions/delete-account";
import { updateSettings, getSettings, type Language, type Style } from "@/actions/settings";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/layout/UserAvatar";
import Link from "next/link";

export default function SettingsPage() {
    const [lang, setLang] = useState<Language>("en");
    const [style, setStyle] = useState<Style>("normal");
    const [loading, setLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [provider, setProvider] = useState("");
    const router = useRouter();

    // Fetch user info
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                router.push("/login");
                return;
            }
            const meta = user.user_metadata;
            setUserName(meta?.full_name || meta?.name || "");
            setUserEmail(user.email || "");
            setProvider(user.app_metadata?.provider || "email");
        });
    }, [router]);

    // Fetch settings
    useEffect(() => {
        getSettings().then(s => {
            setLang(s.voice_lang);
            setStyle(s.style);
        });
    }, []);

    // Hindi → force normal style
    useEffect(() => {
        if (lang === 'hi' && style === 'medical') {
            setStyle('normal');
        }
    }, [lang, style]);

    const handleSave = async () => {
        setLoading(true);
        await updateSettings({ voice_lang: lang, style });
        setLoading(false);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <main className="relative min-h-screen bg-mindful-gradient">
            {/* Ambient background */}
            <div className="fixed inset-0 bg-warm-glow opacity-40 pointer-events-none" />

            <div className="relative z-10 min-h-screen p-4 pb-28">
                <div className="w-full max-w-md mx-auto space-y-6 py-8">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3"
                    >
                        <Link href="/dashboard" className="p-2 text-amber-200/50 hover:text-amber-100 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-light text-amber-100 tracking-wide">My Account</h1>
                    </motion.div>

                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="glass-warm rounded-2xl p-5 border border-white/5"
                    >
                        <div className="flex items-center gap-4">
                            <UserAvatar size="lg" />
                            <div className="flex-1 min-w-0">
                                {userName && (
                                    <p className="text-lg font-light text-amber-100 truncate">{userName}</p>
                                )}
                                <p className="text-sm text-amber-200/50 truncate">{userEmail}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        provider === "google" ? "bg-emerald-400" : "bg-blue-400"
                                    )} />
                                    <span className="text-[10px] uppercase tracking-widest text-amber-200/30 font-semibold">
                                        {provider === "google" ? "Google Account" : "Email Account"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Preferences */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-warm rounded-2xl p-5 border border-white/5 space-y-5"
                    >
                        <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-semibold">
                            Voice Intelligence
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setLang("en")}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                    lang === "en"
                                        ? "bg-amber-500/20 border-amber-500/50 text-amber-100"
                                        : "bg-black/20 border-white/5 text-amber-200/60 hover:bg-white/5"
                                )}
                            >
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Globe className="w-4 h-4 text-amber-400" />
                                </div>
                                <span className="text-sm font-medium">English</span>
                                {lang === "en" && <Check className="w-4 h-4 ml-auto text-amber-400" />}
                            </button>
                            <button
                                onClick={() => { setLang("hi"); if (style === "medical") setStyle("normal"); }}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                    lang === "hi"
                                        ? "bg-amber-500/20 border-amber-500/50 text-amber-100"
                                        : "bg-black/20 border-white/5 text-amber-200/60 hover:bg-white/5"
                                )}
                            >
                                <div className="p-2 bg-rose-500/20 rounded-lg">
                                    <span className="text-xs font-bold text-rose-400">अ</span>
                                </div>
                                <span className="text-sm font-medium">Hindi</span>
                                {lang === "hi" && <Check className="w-4 h-4 ml-auto text-amber-400" />}
                            </button>
                        </div>

                        <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-semibold pt-2">
                            Analysis Tone
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setStyle("normal")}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                    style === "normal"
                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100"
                                        : "bg-black/20 border-white/5 text-amber-200/60 hover:bg-white/5"
                                )}
                            >
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <SparklesIcon className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Balanced</div>
                                    <div className="text-[10px] opacity-60">Growth & Mindset</div>
                                </div>
                                {style === "normal" && <Check className="w-4 h-4 ml-auto text-emerald-400" />}
                            </button>
                            <button
                                onClick={() => setStyle("medical")}
                                disabled={lang === 'hi'}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                    lang === 'hi'
                                        ? "opacity-40 cursor-not-allowed bg-black/10 border-white/5"
                                        : style === "medical"
                                            ? "bg-blue-500/20 border-blue-500/50 text-blue-100"
                                            : "bg-black/20 border-white/5 text-amber-200/60 hover:bg-white/5"
                                )}
                            >
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Stethoscope className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Clinical</div>
                                    <div className="text-[10px] opacity-60">
                                        {lang === 'hi' ? "English Only" : "For medical professionals"}
                                    </div>
                                </div>
                                {style === "medical" && <Check className="w-4 h-4 ml-auto text-blue-400" />}
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-amber-100 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Preferences"}
                        </button>
                    </motion.div>

                    {/* Legal & Privacy */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-warm rounded-2xl p-5 border border-white/5 space-y-2"
                    >
                        <h2 className="text-xs uppercase tracking-widest text-amber-200/40 font-semibold mb-3">
                            Legal & Privacy
                        </h2>
                        <Link
                            href="/privacy"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-amber-200/60 hover:text-amber-100"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="text-sm">Privacy Policy</span>
                        </Link>
                        <Link
                            href="/terms"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-amber-200/60 hover:text-amber-100"
                        >
                            <Shield className="w-4 h-4" />
                            <span className="text-sm">Terms of Service</span>
                        </Link>
                    </motion.div>

                    {/* Sign Out */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-2xl border border-white/5 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="glass-warm rounded-2xl p-5 border border-red-500/10 space-y-3"
                    >
                        <h2 className="text-[10px] uppercase tracking-widest text-red-400/40 font-semibold">
                            Danger Zone
                        </h2>
                        <p className="text-[11px] text-red-200/30 leading-relaxed">
                            Permanently delete your account and all data. This action cannot be undone. Type <span className="text-red-300/60 font-mono">DELETE</span> to confirm.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            placeholder='Type "DELETE" to confirm'
                            className="w-full bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2 text-xs text-red-200/70 placeholder:text-red-200/20 focus:outline-none focus:border-red-500/30 font-mono"
                        />
                        <button
                            disabled={deleteConfirm !== "DELETE" || deleting}
                            onClick={async () => {
                                setDeleting(true);
                                try {
                                    const result = await deleteAccount();
                                    if (result.error) {
                                        alert(result.error);
                                        setDeleting(false);
                                        return;
                                    }
                                    window.location.href = "/login";
                                } catch (err: any) {
                                    console.error("Delete failed:", err);
                                    alert("Something went wrong. Please try again.");
                                    setDeleting(false);
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-red-500/20"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>{deleting ? "Deleting everything..." : "Delete Account Forever"}</span>
                        </button>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 9v4" /><path d="M5 13V9" /><path d="M1 9h4" /></svg>
    )
}
