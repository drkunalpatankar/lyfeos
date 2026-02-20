"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X, Globe, Stethoscope, Check, LogOut, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { deleteAccount } from "@/actions/delete-account";
import { updateSettings, getSettings, type Language, type Style } from "@/actions/settings";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function SettingsDialog() {
    const [open, setOpen] = useState(false);
    const [lang, setLang] = useState<Language>("en");
    const [style, setStyle] = useState<Style>("normal");
    const [loading, setLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    // Fetch initial settings
    useEffect(() => {
        if (open) {
            getSettings().then(s => {
                setLang(s.voice_lang);
                setStyle(s.style);
            });
        }
    }, [open]);

    // Effect: If Hindi is selected, force Normal style
    useEffect(() => {
        if (lang === 'hi' && style === 'medical') {
            setStyle('normal');
        }
    }, [lang, style]);

    const handleSave = async () => {
        setLoading(true);
        await updateSettings({ voice_lang: lang, style });
        setLoading(false);
        setOpen(false);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setOpen(false);
        router.push("/login");
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className="p-2 text-amber-200/50 hover:text-amber-100 transition-colors rounded-full hover:bg-white/5">
                    <Settings className="w-5 h-5" />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-warm rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <Dialog.Title className="text-xl font-light text-amber-100 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-amber-400" />
                                <span className="tracking-wide">Preferences</span>
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="text-amber-200/40 hover:text-amber-100 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <div className="space-y-6">
                            {/* Voice Model / Language */}
                            <div className="space-y-3">
                                <label className="text-xs uppercase tracking-widest text-amber-200/40 font-semibold">
                                    Voice Intelligence
                                </label>
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
                                        <div>
                                            <div className="text-sm font-medium">English</div>
                                        </div>
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
                                        <div>
                                            <div className="text-sm font-medium">Hindi</div>
                                        </div>
                                        {lang === "hi" && <Check className="w-4 h-4 ml-auto text-amber-400" />}
                                    </button>
                                </div>
                            </div>

                            {/* Analysis Tone / Style */}
                            <div className="space-y-3">
                                <label className="text-xs uppercase tracking-widest text-amber-200/40 font-semibold">
                                    Analysis Tone
                                </label>
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
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
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
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-amber-100 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Preferences"}
                            </button>
                        </div>

                        {/* Divider + Logout */}
                        <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign Out</span>
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-4 pt-4 border-t border-red-500/10 space-y-3">
                            <label className="text-[10px] uppercase tracking-widest text-red-400/40 font-semibold">
                                Danger Zone
                            </label>
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
                                    const result = await deleteAccount();
                                    if (result.success) {
                                        setOpen(false);
                                        router.push("/login");
                                    }
                                    setDeleting(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>{deleting ? "Deleting everything..." : "Delete Account Forever"}</span>
                            </button>
                        </div>
                    </motion.div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function Sparkles({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 9v4" /><path d="M5 13V9" /><path d="M1 9h4" /></svg>
    )
}
