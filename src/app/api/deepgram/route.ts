import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

// Force dynamic mode for this route
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

        if (!deepgramApiKey) {
            return NextResponse.json(
                { error: "Deepgram API key not configured" },
                { status: 500 }
            );
        }

        const deepgram = createClient(deepgramApiKey);

        // 1. Get the project ID
        const { result: projects } = await deepgram.manage.getProjects();

        if (!projects?.projects?.[0]) {
            console.warn("No Deepgram projects found. Returning main API key.");
            return NextResponse.json({ key: deepgramApiKey });
        }

        const projectId = projects.projects[0].project_id;
        console.log("Using Project ID:", projectId);

        // 2. Create a temporary, scope-limited key
        const { result: newKey } = await deepgram.manage.createProjectKey(projectId, {
            comment: "LifeOS Client Key",
            scopes: ["usage:write"],
            expiration_date: new Date(Date.now() + 60 * 1000).toISOString(), // 1 minute
            tags: ["lifeos"],
        });

        if (!newKey?.key) {
            console.error("Failed to create temporary key.");
            return NextResponse.json({ key: deepgramApiKey });
        }

        return NextResponse.json({ key: newKey.key });

    } catch (error: any) {
        console.error("Deepgram API Error:", error);
        // Fallback: return the env key if configured
        return NextResponse.json(
            { key: process.env.DEEPGRAM_API_KEY ?? "" }
        );
    }
}
