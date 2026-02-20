import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Privacy Policy — LyFeOS",
    description: "How LyFeOS protects your data.",
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-mindful-gradient">
            <div className="fixed inset-0 bg-warm-glow opacity-40 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 pb-32">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs text-amber-200/40 hover:text-amber-200/70 transition-colors mb-10"
                >
                    <ArrowLeft className="w-3 h-3" />
                    Back
                </Link>

                <h1 className="text-3xl font-light text-amber-100 mb-2 tracking-wide">Privacy Policy</h1>
                <p className="text-xs text-amber-200/30 mb-10">Last updated: February 21, 2025</p>

                <div className="space-y-8 text-sm text-amber-200/70 leading-relaxed font-light">
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-amber-400/60 font-semibold mb-3">What We Collect</h2>
                        <p>LyFeOS collects only the information you voluntarily provide through daily reflections, weekly intentions, and account settings. This includes:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-amber-200/50">
                            <li>Email address (for authentication)</li>
                            <li>Daily vibe scores and text reflections</li>
                            <li>Emotional sentiment tags</li>
                            <li>Weekly intentions</li>
                            <li>Voice recordings (processed in real-time, never stored)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-amber-400/60 font-semibold mb-3">How We Use Your Data</h2>
                        <p>Your data is used exclusively to power your personal intelligence reports. We use Google&apos;s Gemini AI to analyze your weekly patterns — your data is sent to the API for processing and is not stored by Google beyond the API call.</p>
                        <p className="mt-2">We do not sell, share, or rent your personal information to third parties. Ever.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-amber-400/60 font-semibold mb-3">Data Storage</h2>
                        <p>All data is stored securely in Supabase (PostgreSQL) with Row Level Security (RLS) enabled. Only you can access your data. No other user — including administrators — can read your reflections.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-amber-400/60 font-semibold mb-3">Voice Data</h2>
                        <p>When you use voice input, audio is streamed directly to Google&apos;s Speech-to-Text API for transcription. Audio is processed in real-time and is not recorded, stored, or retained by LyFeOS or any third party.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-amber-400/60 font-semibold mb-3">Account Deletion</h2>
                        <p>You may permanently delete your account at any time from Settings. This action is irreversible and results in the complete, permanent deletion of all your data — reflections, intentions, intelligence reports, and settings. We retain nothing.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-amber-400/60 font-semibold mb-3">Cookies</h2>
                        <p>LyFeOS uses only essential authentication cookies to maintain your login session. We do not use analytics cookies, tracking pixels, or any third-party advertising tools.</p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-amber-400/60 font-semibold mb-3">Contact</h2>
                        <p>For privacy inquiries, contact <span className="text-amber-300/80">connect@lyfeos.in</span></p>
                    </section>
                </div>
            </div>
        </main>
    );
}
