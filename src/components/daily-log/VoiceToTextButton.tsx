"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceToTextButtonProps {
    onTranscript: (text: string) => void;
    className?: string;
    language?: string;
    model?: string;
}

const MAX_RECORDING_MS = 5 * 60 * 1000; // 5-minute safety cap

export default function VoiceToTextButton({
    onTranscript,
    className,
    language = "en",
    model = "nova-3"
}: VoiceToTextButtonProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const autoStopRef = useRef<NodeJS.Timeout | null>(null);

    // Recording timer display
    useEffect(() => {
        if (isRecording) {
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setRecordingTime(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    channelCount: 1,
                    sampleRate: 16000,
                }
            });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm'
            });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Small delay to ensure the final audio buffer is flushed
                await new Promise(resolve => setTimeout(resolve, 100));

                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Clean up stream
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                // Clear auto-stop timer
                if (autoStopRef.current) {
                    clearTimeout(autoStopRef.current);
                    autoStopRef.current = null;
                }

                // Only transcribe if we have actual audio data
                if (audioBlob.size > 0) {
                    await handleTranscribe(audioBlob);
                }
            };

            // Start with 1-second timeslice — this ensures ondataavailable
            // fires every second, capturing audio incrementally instead of
            // relying on a single flush at stop(). This prevents the last
            // chunk from being lost.
            mediaRecorder.start(1000);
            setIsRecording(true);

            // 5-minute auto-stop safety cap
            autoStopRef.current = setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                    stopRecording();
                }
            }, MAX_RECORDING_MS);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            // Request one final data flush before stopping
            mediaRecorderRef.current.requestData();
            // Small delay to let the final requestData() resolve
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                    mediaRecorderRef.current.stop();
                }
                setIsRecording(false);
            }, 150);
        }
    };

    const handleTranscribe = async (audioBlob: Blob) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", audioBlob);
            formData.append("language", language);
            formData.append("model", model);

            const response = await fetch("/api/transcribe", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Transcription failed");
            }

            const data = await response.json();
            if (data.transcript) {
                onTranscript(data.transcript);
            }
        } catch (error: any) {
            console.error("Transcription error:", error);
            alert("Transcription failed: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // Format seconds to M:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2">
            {isRecording && (
                <span className="text-[10px] text-red-400/70 font-mono tabular-nums">
                    {formatTime(recordingTime)}
                </span>
            )}
            <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                    "relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                    isRecording
                        ? "bg-red-500/20 text-red-400 animate-pulse"
                        : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
                    isProcessing && "cursor-wait opacity-50",
                    className
                )}
                disabled={isProcessing}
                title={isRecording ? "Stop recording" : "Start voice input"}
            >
                {isRecording && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
                )}

                {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRecording ? (
                    <MicOff className="h-4 w-4" />
                ) : (
                    <Mic className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
