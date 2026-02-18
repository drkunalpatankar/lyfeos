"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    language?: string;
    model?: string;
}

export default function VoiceInput({
    onTranscript,
    language: defaultLang = "en-IN",
    model = "nova-3"
}: VoiceInputProps) {
    const [language, setLanguage] = useState(defaultLang);
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

    const socketRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startListening = async () => {
        setIsLoading(true);
        setError(null);
        setTranscript("");
        setConnectionStatus('connecting');

        try {
            const response = await fetch("/api/deepgram");
            const data = await response.json();

            if (!data.key) {
                throw new Error("Could not retrieve Deepgram API key");
            }

            console.log("✅ Got Deepgram key, connecting WebSocket...");

            // Deepgram WebSocket parameters
            const wsUrl = `wss://api.deepgram.com/v1/listen?` + new URLSearchParams({
                model: model,
                language: language,
                smart_format: "true",
                interim_results: "true",
                encoding: "webm",  // Changed from webm-opus - Deepgram expects just "webm"
                punctuate: "true",
            }).toString();

            console.log("WebSocket URL:", wsUrl);

            const socket = new WebSocket(wsUrl, ["token", data.key]);
            socketRef.current = socket;

            socket.onopen = async () => {
                console.log("✅ WebSocket connected to Deepgram");
                setConnectionStatus('connected');

                try {
                    // Request microphone with default settings
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });
                    streamRef.current = stream;

                    // Create MediaRecorder with webm/opus format
                    const mediaRecorder = new MediaRecorder(stream, {
                        mimeType: "audio/webm;codecs=opus"
                    });
                    mediaRecorderRef.current = mediaRecorder;

                    mediaRecorder.ondataavailable = (event) => {
                        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                            socket.send(event.data);
                        }
                    };

                    mediaRecorder.start(250);
                    setIsListening(true);
                    setIsLoading(false);
                    console.log("🎤 Microphone started, streaming audio to Deepgram...");

                } catch (micError: any) {
                    console.error("❌ Microphone error:", micError);
                    setError("Microphone access denied. Please allow mic permission.");
                    setIsLoading(false);
                    setConnectionStatus('disconnected');
                    socket.close();
                }
            };

            socket.onmessage = (message) => {
                try {
                    const data = JSON.parse(message.data);
                    const transcriptText = data.channel?.alternatives?.[0]?.transcript;

                    if (transcriptText && transcriptText.trim()) {
                        console.log("📝 Transcript received:", transcriptText);
                        setTranscript(prev => {
                            const newText = prev ? prev + " " + transcriptText : transcriptText;
                            onTranscript(newText);
                            return newText;
                        });
                    }
                } catch (err) {
                    console.error("❌ Error parsing Deepgram message:", err);
                }
            };

            socket.onerror = (err) => {
                console.error("❌ WebSocket error:", err);
                setError("Connection error. Check your network.");
                setConnectionStatus('disconnected');
                setIsLoading(false);
            };

            socket.onclose = () => {
                console.log("🔌 WebSocket closed");
                setConnectionStatus('disconnected');
                setIsListening(false);
            };

        } catch (err: any) {
            console.error("❌ Error starting voice:", err);
            setError(err.message || "Could not start voice input");
            setConnectionStatus('disconnected');
            setIsLoading(false);
        }
    };

    const stopListening = () => {
        console.log("⏹️ Stopping voice input...");

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
            socketRef.current.close();
            socketRef.current = null;
        }

        setConnectionStatus('disconnected');
        setIsListening(false);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            {/* Language Toggle */}
            <div className="flex bg-secondary/50 p-1 rounded-full">
                <button
                    onClick={() => setLanguage('en-IN')}
                    disabled={isListening}
                    className={cn(
                        "px-4 py-1.5 text-xs font-medium rounded-full transition-all",
                        language === 'en-IN'
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        isListening && "opacity-50 cursor-not-allowed"
                    )}
                >
                    English (IN)
                </button>
                <button
                    onClick={() => setLanguage('hi')}
                    disabled={isListening}
                    className={cn(
                        "px-4 py-1.5 text-xs font-medium rounded-full transition-all",
                        language === 'hi'
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        isListening && "opacity-50 cursor-not-allowed"
                    )}
                >
                    हिन्दी
                </button>
            </div>

            {/* Connection Status Indicator */}
            {connectionStatus !== 'disconnected' && (
                <div className="flex items-center gap-2 text-xs">
                    {connectionStatus === 'connecting' ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                            <span className="text-amber-300/70">Connecting to Deepgram...</span>
                        </>
                    ) : (
                        <>
                            <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
                            <span className="text-emerald-300/70">Connected • Ready to transcribe</span>
                        </>
                    )}
                </div>
            )}

            {/* Mic Button */}
            <button
                onClick={toggleListening}
                className={cn(
                    "relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300",
                    isListening
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 shadow-lg shadow-red-500/25"
                        : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
                    isLoading && "cursor-wait opacity-50"
                )}
                disabled={isLoading}
            >
                {isListening && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-500/30 duration-1000" />
                )}

                {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                ) : isListening ? (
                    <MicOff className="h-8 w-8" />
                ) : (
                    <Mic className="h-8 w-8" />
                )}
            </button>

            <p className="text-sm font-light text-amber-200/70">
                {isLoading ? "Starting..." : isListening ? "Listening..." : "Tap to speak"}
            </p>

            {error && (
                <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs max-w-md">
                    {error}
                </div>
            )}

            {/* Always-visible Transcript Box */}
            <div className="w-full max-w-md rounded-xl border border-amber-200/10 bg-black/20 backdrop-blur-sm p-5 shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-amber-200/50 font-light uppercase tracking-wider">
                        Live Transcript
                    </span>
                    {isListening && (
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                            <span className="text-xs text-red-300/70">Recording</span>
                        </span>
                    )}
                </div>

                {transcript ? (
                    <div className="text-sm text-amber-100 leading-relaxed min-h-[60px]">
                        {transcript}
                    </div>
                ) : (
                    <div className="text-sm text-amber-200/30 italic min-h-[60px] flex items-center">
                        {isListening ? "Listening... speak now" : "Tap microphone and start speaking"}
                    </div>
                )}
            </div>
        </div>
    );
}
