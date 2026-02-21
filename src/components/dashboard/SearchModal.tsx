"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchLogs, type SearchResult } from "@/actions/search-logs";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchModalProps {
    open: boolean;
    onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery("");
            setResults([]);
            setSearched(false);
        }
    }, [open]);

    // Debounced search
    const handleSearch = useCallback((value: string) => {
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setResults([]);
            setSearched(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            setSearched(true);
            const { data } = await searchLogs(value);
            setResults(data);
            setLoading(false);
        }, 400);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    // Highlight matching text
    const highlightMatch = (text: string, q: string) => {
        if (!q.trim()) return text;
        const words = q.trim().split(/\s+/);
        const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part)
                ? <mark key={i} className="bg-amber-500/30 text-amber-200 rounded px-0.5">{part}</mark>
                : part
        );
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
                >
                    <div className="h-full flex flex-col max-w-2xl mx-auto px-4 pt-6 pb-4">

                        {/* Search Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search your reflections..."
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-amber-500/20 rounded-xl text-amber-100 placeholder:text-amber-200/25 focus:outline-none focus:border-amber-500/50 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] text-sm transition-all"
                                />
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-amber-200/50 hover:text-amber-100 transition-all shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto space-y-3 pb-20">
                            {loading && (
                                <div className="flex justify-center py-12">
                                    <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                                </div>
                            )}

                            {!loading && searched && results.length === 0 && (
                                <div className="text-center py-16">
                                    <p className="text-amber-200/30 text-sm">No reflections match &quot;{query}&quot;</p>
                                    <p className="text-amber-200/20 text-xs mt-1">Try different keywords</p>
                                </div>
                            )}

                            {!loading && results.map((log) => {
                                const date = parseISO(log.date);
                                const workRef = log.reflections?.find(r => r.type === 'work');
                                const personalRef = log.reflections?.find(r => r.type === 'personal');
                                const allTags = [
                                    ...(workRef?.sentiment_tags || []),
                                    ...(personalRef?.sentiment_tags || [])
                                ].slice(0, 3);

                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-warm p-4 rounded-xl border border-white/5 hover:border-amber-500/20 transition-all"
                                    >
                                        {/* Date + Tags Row */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-lg font-light text-amber-100">
                                                    {format(date, "d")}
                                                </span>
                                                <span className="text-[10px] uppercase tracking-widest text-amber-500/60 font-medium">
                                                    {format(date, "MMM yyyy")}
                                                </span>
                                            </div>
                                            <div className="flex gap-1.5 ml-auto">
                                                {allTags.map(tag => (
                                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300/70 border border-amber-500/15">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Vibes */}
                                        <div className="flex items-center gap-3 mb-2 text-xs text-amber-200/40">
                                            <span>
                                                {log.work_score === 3 ? "😓" : log.work_score === 9 ? "🔥" : "⚡"} Work
                                            </span>
                                            <span>
                                                {log.personal_score === 3 ? "😔" : log.personal_score === 9 ? "✨" : "☁️"} Life
                                            </span>
                                        </div>

                                        {/* Matched Content */}
                                        {workRef?.learning && (
                                            <p className="text-sm text-gray-300 leading-relaxed mb-1">
                                                {highlightMatch(workRef.learning, query)}
                                            </p>
                                        )}
                                        {personalRef?.learning && (
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {highlightMatch(personalRef.learning, query)}
                                            </p>
                                        )}
                                    </motion.div>
                                );
                            })}

                            {!loading && !searched && (
                                <div className="text-center py-16">
                                    <Search className="w-8 h-8 text-amber-500/15 mx-auto mb-3" />
                                    <p className="text-amber-200/25 text-sm">Search across all your journal entries</p>
                                    <p className="text-amber-200/15 text-xs mt-1">Learnings, improvements, moments, transcripts</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
