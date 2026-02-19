import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
        if (!deepgramApiKey) {
            return NextResponse.json(
                { error: "Deepgram API key not configured" },
                { status: 500 }
            );
        }

        const deepgram = createClient(deepgramApiKey);

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // 1. Get User
        // Note: For now, we'll default to standard params if auth fails in API route
        // In a production app, we should pass the JWT or user ID to look up preferences.
        // For simplicity in this MVP, we will accept 'model' and 'language' as form fields
        // sent from the client (which has the settings state).

        const modelPref = formData.get("model") as string || "nova-3";
        const languagePref = formData.get("language") as string || "en";

        // Map preferences to Deepgram models
        let model = "nova-3";
        if (modelPref === "medical") {
            model = "nova-3-medical";
        }

        // Send to Deepgram for transcription
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
            buffer,
            {
                model,
                language: languagePref,
                smart_format: true,
                punctuate: true,
                mimetype: file.type || "audio/webm",
            }
        );

        if (error) {
            console.error("Deepgram Error:", error);
            throw error;
        }

        const transcript = result.results?.channels[0]?.alternatives[0]?.transcript;

        return NextResponse.json({ transcript });

    } catch (error: any) {
        console.error("Transcription error:", error);
        return NextResponse.json(
            { error: error.message || "Transcription failed" },
            { status: 500 }
        );
    }
}
