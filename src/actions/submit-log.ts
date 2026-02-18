"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SubmitLogParams {
    date: string; // YYYY-MM-DD
    metrics: {
        work: number;
        personal: number;
        health: number;
        sleep: number;
    };
    work: {
        score: number;
        learning: string;
        improvement: string;
        tags: string[];
    };
    personal: {
        score: number; // mapped from personal step score
        moment: string;
        improvement: string;
        tags: string[];
    };
}

export async function submitLog(data: SubmitLogParams) {
    const supabase = await createClient();

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    // 2. Insert Daily Log (Quant Data)
    console.log("Attempting to insert daily log for user:", user.id);

    const fullTranscript = `
        [Work Learning] ${data.work.learning}
        [Work Improvement] ${data.work.improvement}
        [Personal Moment] ${data.personal.moment}
        [Personal Improvement] ${data.personal.improvement}
    `.trim();

    const { data: log, error: logError } = await supabase
        .from("daily_logs")
        .upsert({
            user_id: user.id,
            date: data.date,
            work_hours: data.metrics.work,
            personal_hours: data.metrics.personal,
            health_hours: data.metrics.health,
            sleep_hours: data.metrics.sleep,
            work_score: data.work.score,
            personal_score: data.personal.score,
            transcript: fullTranscript,
        }, { onConflict: "user_id, date" })
        .select()
        .single();

    if (logError) {
        console.error("Values attempted:", {
            user_id: user.id,
            date: data.date,
            work_hours: data.metrics.work,
            transcript_length: fullTranscript.length
        });
        console.error("FULL DB ERROR:", JSON.stringify(logError, null, 2));
        throw new Error(`Database Error: ${logError.message}`);
    }

    if (!log) return { error: "Failed to create log entry" };

    // 3. Insert Reflections (Qual Data)

    // Work Reflection
    const workReflectionPromise = supabase
        .from("reflections")
        .insert({
            log_id: log.id,
            user_id: user.id,
            type: "work",
            learning: data.work.learning,
            improvement: data.work.improvement,
            sentiment_tags: data.work.tags,
        });

    // Personal Reflection
    const personalReflectionPromise = supabase
        .from("reflections")
        .insert({
            log_id: log.id,
            user_id: user.id,
            type: "personal",
            learning: data.personal.moment, // Mapping "Meaningful Moment" to learning col
            improvement: data.personal.improvement,
            sentiment_tags: data.personal.tags,
        });

    // Run parallel
    const [workResult, personalResult] = await Promise.all([
        workReflectionPromise,
        personalReflectionPromise
    ]);

    if (workResult.error) console.error("Work Reflection Error:", workResult.error);
    if (personalResult.error) console.error("Personal Reflection Error:", personalResult.error);

    revalidatePath("/");
    return { success: true };
}
