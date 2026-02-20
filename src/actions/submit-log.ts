"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface SubmitLogParams {
    date: string; // YYYY-MM-DD
    metrics?: {
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
        score: number;
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

    const metrics = data.metrics || { work: 0, personal: 0, health: 0, sleep: 0 };

    const { data: log, error: logError } = await supabase
        .from("daily_logs")
        .upsert({
            user_id: user.id,
            date: data.date,
            work_hours: metrics.work,
            personal_hours: metrics.personal,
            health_hours: metrics.health,
            sleep_hours: metrics.sleep,
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
            work_hours: metrics.work,
            transcript_length: fullTranscript.length
        });
        console.error("FULL DB ERROR:", JSON.stringify(logError, null, 2));
        throw new Error(`Database Error: ${logError.message}`);
    }

    if (!log) return { error: "Failed to create log entry" };

    // 3. Delete existing reflections for this log (prevents duplicates on re-submit)
    await supabase
        .from("reflections")
        .delete()
        .eq("log_id", log.id)
        .eq("user_id", user.id);

    // 4. Insert fresh reflections

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
    revalidatePath("/dashboard");
    return { success: true };
}

// Fetch a log + reflections for a specific date (used for edit mode)
export async function getLogForDate(date: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Same-day lockout: allow for timezone variance between client (e.g. IST) and Vercel server (UTC)
    const serverTime = new Date().getTime();
    const targetTime = new Date(date).getTime();
    const diffHours = Math.abs(serverTime - targetTime) / (1000 * 60 * 60);

    if (diffHours > 48) {
        return { error: "Can only edit today's log" };
    }

    const { data: log } = await supabase
        .from("daily_logs")
        .select(`
            id, date, work_score, personal_score,
            reflections (
                type, learning, improvement, sentiment_tags
            )
        `)
        .eq("user_id", user.id)
        .eq("date", date)
        .single();

    if (!log) return { error: "No log found for this date" };

    const workRef = (log.reflections as any[])?.find((r: any) => r.type === "work");
    const personalRef = (log.reflections as any[])?.find((r: any) => r.type === "personal");

    return {
        log: {
            date: log.date,
            work: {
                score: log.work_score || 6,
                learning: workRef?.learning || "",
                improvement: workRef?.improvement || "",
                tags: workRef?.sentiment_tags || [],
            },
            personal: {
                score: log.personal_score || 6,
                moment: personalRef?.learning || "",
                improvement: personalRef?.improvement || "",
                tags: personalRef?.sentiment_tags || [],
            },
        },
    };
}
