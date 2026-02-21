"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Mic, Brain, TrendingUp, ArrowRight,
    Sparkles, Lock, ChevronDown, Zap
} from "lucide-react";

/* ═══════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════ */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const } },
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1, ease: [0.25, 0.4, 0.25, 1] as const } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const } },
};

/* ═══════════════════════════════════════════
   Golden Particle Field
   ═══════════════════════════════════════════ */
function GoldenParticles() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${Math.random() * 3 + 1}px`,
                        height: `${Math.random() * 3 + 1}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: `radial-gradient(circle, rgba(251, 191, 36, ${Math.random() * 0.4 + 0.1}), transparent)`,
                        animation: `float-up ${Math.random() * 15 + 10}s linear infinite`,
                        animationDelay: `${Math.random() * 10}s`,
                    }}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════
   Feature Data
   ═══════════════════════════════════════════ */
const features = [
    {
        icon: Mic,
        title: "Voice-First Logging",
        desc: "Speak your reflections naturally. AI transcribes and structures them into actionable insights.",
        gradient: "from-amber-500/20 to-amber-600/5",
        iconBg: "bg-amber-500/15",
        iconColor: "text-amber-400",
        glowColor: "group-hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]",
    },
    {
        icon: Brain,
        title: "Weekly Intelligence",
        desc: "Every Saturday, AI analyzes your patterns and delivers a personalized growth report.",
        gradient: "from-purple-500/20 to-purple-600/5",
        iconBg: "bg-purple-500/15",
        iconColor: "text-purple-400",
        glowColor: "group-hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]",
    },
    {
        icon: TrendingUp,
        title: "Visual Timeline",
        desc: "Your journey as a beautiful chronological feed. Navigate months and years of growth.",
        gradient: "from-emerald-500/20 to-emerald-600/5",
        iconBg: "bg-emerald-500/15",
        iconColor: "text-emerald-400",
        glowColor: "group-hover:shadow-[0_0_40px_rgba(52,211,153,0.12)]",
    },
    {
        icon: Lock,
        title: "PIN-Protected Privacy",
        desc: "Your journal is locked behind a 4-digit PIN. Even if someone picks up your phone.",
        gradient: "from-rose-500/20 to-rose-600/5",
        iconBg: "bg-rose-500/15",
        iconColor: "text-rose-400",
        glowColor: "group-hover:shadow-[0_0_40px_rgba(244,63,94,0.12)]",
    },
];

const steps = [
    {
        num: "01",
        title: "Log your day",
        desc: "Pick your vibe. Speak or type your reflections — what you learned, what you'd improve. Takes 60 seconds.",
        icon: Mic,
    },
    {
        num: "02",
        title: "AI finds patterns",
        desc: "Every Saturday night, AI analyzes your week — emotional trends, learning clusters, risk flags — and creates your Intelligence Report.",
        icon: Brain,
    },
    {
        num: "03",
        title: "Grow with clarity",
        desc: "Wake up Sunday to actionable recommendations. Set weekly intentions. Track your evolution over months and years.",
        icon: Sparkles,
    },
];

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */
export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

    return (
        <div ref={containerRef} className="min-h-screen bg-mindful-gradient text-amber-100 overflow-hidden relative">

            {/* ═══ ANIMATED MESH GRADIENT BACKGROUND ═══ */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Large drifting orbs */}
                <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full animate-mesh"
                    style={{ background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)" }} />
                <div className="absolute top-[20%] -right-[15%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full animate-mesh-slow"
                    style={{ background: "radial-gradient(circle, rgba(244, 63, 94, 0.05) 0%, transparent 70%)", animationDelay: "5s" }} />
                <div className="absolute top-[50%] -left-[20%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full animate-mesh"
                    style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)", animationDelay: "10s" }} />
                <div className="absolute -bottom-[10%] right-[10%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full animate-mesh-slow"
                    style={{ background: "radial-gradient(circle, rgba(20, 184, 166, 0.04) 0%, transparent 70%)", animationDelay: "15s" }} />

                {/* Subtle noise/grain overlay */}
                <div className="absolute inset-0 opacity-[0.015]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />
            </div>

            {/* Golden particles */}
            <GoldenParticles />

            {/* ═══════════ STICKY NAV ═══════════ */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b border-white/[0.06]"
                style={{ background: "linear-gradient(135deg, hsla(240,15%,6%,0.9), hsla(260,20%,12%,0.9))" }}>
                <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <Image
                                src="/icon-512.png"
                                alt="LyFeOS"
                                width={30}
                                height={30}
                                className="rounded-lg relative z-10"
                            />
                            <div className="absolute inset-0 bg-amber-500/20 rounded-lg blur-md" />
                        </div>
                        <span className="text-sm font-medium tracking-wider text-amber-100/90">LyFeOS</span>
                    </div>
                    <Link
                        href="/login"
                        className="px-5 py-1.5 text-sm font-light rounded-full border border-amber-500/20 bg-amber-500/[0.06] hover:bg-amber-500/15 text-amber-200/80 hover:text-amber-100 transition-all duration-300 hover:border-amber-400/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                    >
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* ═══════════ HERO ═══════════ */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-[100dvh] flex flex-col items-center justify-center px-5 sm:px-6 pt-14 z-10"
            >
                {/* Hero glow behind content */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] rounded-full animate-breathe-slow"
                    style={{ background: "radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, rgba(244, 63, 94, 0.03) 40%, transparent 70%)" }} />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="relative z-10 text-center max-w-2xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        variants={fadeUp}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/15 text-[11px] uppercase tracking-widest text-amber-400/70 mb-6"
                    >
                        <Sparkles className="w-3 h-3" />
                        AI-Powered Journaling
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        variants={fadeUp}
                        className="text-4xl sm:text-5xl md:text-6xl font-extralight leading-[1.1] tracking-tight"
                    >
                        The Life
                        <br />
                        <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                            Operating System
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        variants={fadeUp}
                        className="mt-6 text-base sm:text-lg font-light text-amber-200/40 leading-relaxed max-w-lg mx-auto"
                    >
                        Speak your day. Let AI find the patterns you can&apos;t see.
                        Grow with weekly intelligence that knows you.
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                        variants={fadeUp}
                        className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
                    >
                        <Link
                            href="/login"
                            className="group px-8 py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full text-sm font-medium hover:scale-105 transition-all duration-300 active:scale-95 flex items-center gap-2 animate-golden-pulse"
                        >
                            Start Your Journey
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <span className="text-[11px] text-amber-200/20">Free · No credit card</span>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute bottom-8 flex flex-col items-center gap-1.5 text-amber-200/20"
                >
                    <span className="text-[9px] uppercase tracking-[0.25em]">Explore</span>
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                </motion.div>
            </motion.section>

            {/* ═══════════ GOLDEN DIVIDER ═══════════ */}
            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <div className="h-px w-full animate-shimmer rounded-full" />
            </div>

            {/* ═══════════ PROBLEM ═══════════ */}
            <section className="relative py-20 sm:py-28 px-5 sm:px-6 z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={stagger}
                    className="max-w-2xl mx-auto text-center"
                >
                    <motion.p variants={fadeUp} className="text-xl sm:text-2xl font-extralight text-amber-200/30 leading-relaxed">
                        You live busy days. You reflect in passing.
                        <br />
                        <span className="text-amber-200/60">But do you actually remember what you learned?</span>
                    </motion.p>
                    <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center gap-3">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/30" />
                        <Zap className="w-4 h-4 text-amber-500/40" />
                        <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/30" />
                    </motion.div>
                    <motion.p variants={fadeUp} className="mt-6 text-sm text-amber-400/50 font-medium tracking-wide">
                        LyFeOS remembers for you.
                    </motion.p>
                </motion.div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section className="relative py-16 sm:py-20 px-5 sm:px-6 z-10">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                        className="text-center mb-14 sm:mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight">
                            Everything you need to{" "}
                            <span className="text-amber-400">grow</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={stagger}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={scaleIn}
                                className={`group relative p-6 sm:p-7 rounded-2xl backdrop-blur-xl border border-white/[0.06] hover:border-amber-500/20 transition-all duration-500 cursor-default ${feature.glowColor}`}
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                                }}
                            >
                                {/* Glass gradient overlay */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className={`w-10 h-10 rounded-xl ${feature.iconBg} backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                                    </div>
                                    <h3 className="text-base font-light text-amber-100 mb-1.5">{feature.title}</h3>
                                    <p className="text-sm font-light text-amber-200/30 leading-relaxed group-hover:text-amber-200/45 transition-colors duration-300">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════ GOLDEN DIVIDER ═══════════ */}
            <div className="relative z-10 max-w-3xl mx-auto px-6">
                <div className="h-px w-full animate-shimmer rounded-full" />
            </div>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="relative py-20 sm:py-28 px-5 sm:px-6 z-10">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={fadeUp}
                        className="text-center mb-14 sm:mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight">
                            Three steps.{" "}
                            <span className="text-amber-400">Every day.</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={stagger}
                        className="space-y-6 sm:space-y-8"
                    >
                        {steps.map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeUp}
                                className="group flex gap-5 sm:gap-6 items-start p-5 sm:p-6 rounded-2xl border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] transition-all duration-300"
                            >
                                <div className="shrink-0 relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border border-amber-500/15 flex items-center justify-center group-hover:scale-105 group-hover:border-amber-500/25 transition-all duration-300">
                                        <span className="text-sm font-light text-amber-400/80 tracking-wide">{item.num}</span>
                                    </div>
                                    {/* Connector line */}
                                    {idx < steps.length - 1 && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-6 sm:h-8 bg-gradient-to-b from-amber-500/15 to-transparent" />
                                    )}
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg font-light text-amber-100 mb-1">{item.title}</h3>
                                    <p className="text-sm font-light text-amber-200/30 leading-relaxed max-w-md group-hover:text-amber-200/40 transition-colors duration-300">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ═══════════ FOUNDER ═══════════ */}
            <section className="relative py-20 sm:py-24 px-5 sm:px-6 z-10">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeUp}
                    className="max-w-lg mx-auto text-center"
                >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/25 to-rose-500/15 animate-breathe" />
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/10 border border-amber-500/15 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-2xl">🩺</span>
                        </div>
                    </div>
                    <blockquote className="text-base sm:text-lg font-extralight text-amber-200/50 leading-relaxed italic">
                        &ldquo;As a doctor, I juggle surgeries, patients, and a personal life.
                        I built LyFeOS because I needed a system to capture learnings
                        before they vanished with the next busy day.&rdquo;
                    </blockquote>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-amber-200/20">
                        Dr. Kunal Patankar · Founder
                    </p>
                </motion.div>
            </section>

            {/* ═══════════ FINAL CTA ═══════════ */}
            <section className="relative py-20 sm:py-28 px-5 sm:px-6 z-10">
                {/* Warm glow behind CTA */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
                        style={{ background: "radial-gradient(ellipse, rgba(245, 158, 11, 0.06) 0%, transparent 70%)" }} />
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="relative z-10 max-w-md mx-auto text-center"
                >
                    <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-extralight tracking-tight mb-4">
                        Ready to start?
                    </motion.h2>
                    <motion.p variants={fadeUp} className="text-sm text-amber-200/30 mb-8 font-light">
                        60 seconds a day. That&apos;s all it takes to build self-awareness.
                    </motion.p>
                    <motion.div variants={fadeUp}>
                        <Link
                            href="/login"
                            className="group inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full text-sm font-medium hover:scale-105 transition-all duration-300 active:scale-95 animate-golden-pulse"
                        >
                            Begin Your Journey
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="relative z-10 border-t border-white/[0.06] py-8 sm:py-10 px-5 sm:px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <Image
                            src="/icon-512.png"
                            alt="LyFeOS"
                            width={18}
                            height={18}
                            className="rounded opacity-50"
                        />
                        <span className="text-xs text-amber-200/20 tracking-wide">© 2026 LyFeOS</span>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-xs text-amber-200/20 hover:text-amber-200/50 transition-colors duration-300">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-xs text-amber-200/20 hover:text-amber-200/50 transition-colors duration-300">
                            Terms
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
