"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceToTextButtonProps {
    onTranscript: (text: string) => void;
    className?: string;
    language?: string;
    model?: string;
}

export default function VoiceToTextButton({
    onTranscript,
    className,
    language = "en",
    model = "nova-3"
}: VoiceToTextButtonProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await handleTranscribe(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
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

    return (
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
    );
}
