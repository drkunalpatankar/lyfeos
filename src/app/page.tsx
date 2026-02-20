"use client";

import { submitLog, getLogForDate } from "@/actions/submit-log";
import VibeSelector from "@/components/daily-log/VibeSelector";
import EmotionChipSelector from "@/components/daily-log/EmotionChipSelector";
import VoiceToTextButton from "@/components/daily-log/VoiceToTextButton";
import SettingsDialog from "@/components/layout/SettingsDialog";
import { getSettings } from "@/actions/settings";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = 1 | 2;

export default function Home() {
    return (
        <Suspense>
            <HomeContent />
        </Suspense>
    );
}

function HomeContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const editDate = searchParams.get("edit");
    const isEditMode = !!editDate;

    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [editLoading, setEditLoading] = useState(false);

    // Step 1: Work reflection
    const [workScore, setWorkScore] = useState(6);
    const [workEmotions, setWorkEmotions] = useState<string[]>([]);
    const [workLearning, setWorkLearning] = useState("");
    const [workImprovement, setWorkImprovement] = useState("");

    // Step 2: Personal reflection
    const [personalScore, setPersonalScore] = useState(6);
    const [personalEmotions, setPersonalEmotions] = useState<string[]>([]);
    const [personalMoment, setPersonalMoment] = useState("");
    const [personalImprovement, setPersonalImprovement] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Settings State
    const [language, setLanguage] = useState("en");
    const [style, setStyle] = useState("normal");

    useEffect(() => {
        getSettings().then(s => {
            setLanguage(s.voice_lang);
            setStyle(s.style);
        });
    }, []);

    // Edit mode: fetch existing log and pre-fill
    useEffect(() => {
        if (!editDate) return;
        const today = new Date().toISOString().split("T")[0];
        if (editDate !== today) {
            toast.error("Can only edit today's log");
            router.push("/dashboard");
            return;
        }
        setEditLoading(true);
        getLogForDate(editDate).then((result) => {
            if (result.error || !result.log) {
                toast.error(result.error || "Log not found");
                router.push("/dashboard");
                return;
            }
            const d = result.log;
            setWorkScore(d.work.score);
            setWorkEmotions(d.work.tags);
            setWorkLearning(d.work.learning);
            setWorkImprovement(d.work.improvement);
            setPersonalScore(d.personal.score);
            setPersonalEmotions(d.personal.tags);
            setPersonalMoment(d.personal.moment);
            setPersonalImprovement(d.personal.improvement);
            setEditLoading(false);
        });
    }, [editDate, router]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await submitLog({
                date: new Date().toISOString().split('T')[0],
                metrics: { work: 0, personal: 0, health: 0, sleep: 0 },
                work: {
                    score: workScore,
                    learning: workLearning,
                    improvement: workImprovement,
                    tags: workEmotions
                },
                personal: {
                    score: personalScore,
                    moment: personalMoment,
                    improvement: personalImprovement,
                    tags: personalEmotions
                }
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(isEditMode ? "✏️ Log updated." : "✨ Day captured. Rest well.");
                setTimeout(() => {
                    if (isEditMode) {
                        router.push("/dashboard");
                    } else {
                        window.location.reload();
                    }
                }, 1500);
            }
        } catch (e) {
            console.error(e);
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-mindful-gradient">
            {/* Ambient background */}
            <div className="fixed inset-0 bg-warm-glow opacity-40 pointer-events-none" />
            <div className="fixed top-20 left-10 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-breathe-slow" />
            <div className="fixed bottom-20 right-10 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl animate-breathe" />

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pb-24">
                <div className="w-full max-w-md space-y-8 py-12">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-3"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10" /> {/* Spacer for balance */}
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                                <h1 className="text-3xl font-light tracking-wide text-amber-100">LyFeOS</h1>
                                <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
                            </div>
                            <SettingsDialog />
                        </div>
                        {isEditMode ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20">✏️ Editing today&apos;s log</span>
                                <Link href="/dashboard" className="text-xs text-amber-200/40 hover:text-amber-200/70 transition-colors">
                                    <X className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <p className="text-base text-amber-200/70 font-light">
                                Reflect on your day
                            </p>
                        )}
                    </motion.div>

                    {/* Step Indicator */}
                    <div className="flex justify-center gap-2">
                        {[1, 2].map((step) => (
                            <div
                                key={step}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-300",
                                    step === currentStep ? "w-12 bg-amber-400" : "w-8 bg-amber-400/20",
                                    step < currentStep && "bg-emerald-400"
                                )}
                            />
                        ))}
                    </div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-warm rounded-3xl p-8 shadow-2xl space-y-8"
                            >
                                <h2 className="text-lg font-light text-amber-100">Work Reflection</h2>

                                <VibeSelector type="work" value={workScore} onChange={setWorkScore} />

                                <EmotionChipSelector type="work" selected={workEmotions} onChange={setWorkEmotions} />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-light text-amber-200/70">
                                            What did you learn today? <span className="text-amber-400/50">*</span>
                                        </label>
                                        <VoiceToTextButton
                                            onTranscript={(text) => setWorkLearning(prev => prev + " " + text)}
                                            language={language}
                                            model={style === 'medical' ? 'medical' : 'nova-3'}
                                        />
                                    </div>
                                    <textarea
                                        value={workLearning}
                                        onChange={(e) => setWorkLearning(e.target.value)}
                                        placeholder="Key takeaway, insight, or lesson..."
                                        className="w-full h-24 px-4 py-3 bg-black/20 border border-amber-200/10 rounded-xl text-amber-100 placeholder:text-amber-200/30 focus:outline-none focus:border-amber-400/40 resize-none"
                                    />
                                    <div className="text-xs text-amber-200/40 text-right">
                                        {workLearning.length} characters {workLearning.length > 200 && "• Detailed"}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-light text-amber-200/70">
                                            What could improve? <span className="text-amber-200/40">(optional)</span>
                                        </label>
                                        <VoiceToTextButton
                                            onTranscript={(text) => setWorkImprovement(prev => prev + " " + text)}
                                            language={language}
                                            model={style === 'medical' ? 'medical' : 'nova-3'}
                                        />
                                    </div>
                                    <textarea
                                        value={workImprovement}
                                        onChange={(e) => setWorkImprovement(e.target.value)}
                                        placeholder="Process, skill, or habit to work on..."
                                        className="w-full h-20 px-4 py-3 bg-black/20 border border-amber-200/10 rounded-xl text-amber-100 placeholder:text-amber-200/30 focus:outline-none focus:border-amber-400/40 resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-warm rounded-3xl p-8 shadow-2xl space-y-8"
                            >
                                <h2 className="text-lg font-light text-amber-100">Personal Reflection</h2>

                                <VibeSelector type="personal" value={personalScore} onChange={setPersonalScore} />

                                <EmotionChipSelector type="personal" selected={personalEmotions} onChange={setPersonalEmotions} />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-light text-amber-200/70">
                                            What was meaningful today? <span className="text-amber-400/50">*</span>
                                        </label>
                                        <VoiceToTextButton
                                            onTranscript={(text) => setPersonalMoment(prev => prev + " " + text)}
                                            language={language}
                                            model={style === 'medical' ? 'medical' : 'nova-3'}
                                        />
                                    </div>
                                    <textarea
                                        value={personalMoment}
                                        onChange={(e) => setPersonalMoment(e.target.value)}
                                        placeholder="A moment, connection, or experience..."
                                        className="w-full h-24 px-4 py-3 bg-black/20 border border-amber-200/10 rounded-xl text-amber-100 placeholder:text-amber-200/30 focus:outline-none focus:border-amber-400/40 resize-none"
                                    />
                                    <div className="text-xs text-amber-200/40 text-right">
                                        {personalMoment.length} characters {personalMoment.length > 200 && "• Detailed"}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-light text-amber-200/70">
                                            What could improve? <span className="text-amber-200/40">(optional)</span>
                                        </label>
                                        <VoiceToTextButton
                                            onTranscript={(text) => setPersonalImprovement(prev => prev + " " + text)}
                                            language={language}
                                            model={style === 'medical' ? 'medical' : 'nova-3'}
                                        />
                                    </div>
                                    <textarea
                                        value={personalImprovement}
                                        onChange={(e) => setPersonalImprovement(e.target.value)}
                                        placeholder="Relationship, health, or habit..."
                                        className="w-full h-20 px-4 py-3 bg-black/20 border border-amber-200/10 rounded-xl text-amber-100 placeholder:text-amber-200/30 focus:outline-none focus:border-amber-400/40 resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className={currentStep === 2 ? "flex flex-col-reverse gap-3 sm:flex-row sm:gap-4" : "flex gap-4"}>
                        {currentStep > 1 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setCurrentStep(1)}
                                className="w-full sm:flex-1 py-4 bg-white/5 border border-amber-200/20 text-amber-200 rounded-full font-light flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </motion.button>
                        )}

                        {currentStep < 2 ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setCurrentStep(2)}
                                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full font-light flex items-center justify-center gap-2"
                            >
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting || !workLearning || !personalMoment}
                                onClick={handleSubmit}
                                className="w-full sm:flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-light flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        {isEditMode ? "Update Log" : "Complete Reflection"}
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-amber-200/40 font-light">
                        Step {currentStep} of 2 • Take your time
                    </p>
                </div>
            </div>
        </main>
    );
}
