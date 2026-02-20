"use server";

import { createClient } from "@/lib/supabase/server";
import { model, INTELLIGENCE_SYSTEM_PROMPT } from "@/lib/gemini";
import { startOfWeek, endOfWeek, format } from "date-fns";

const MIN_LOGS_REQUIRED = 3;

export interface IntentionEvaluation {
    intention: string;
    category: "work" | "personal";
    status: "achieved" | "partial" | "missed";
    evidence: string;
    insight: string;
}

export interface IntentionScorecard {
    total: number;
    achieved: number;
    partial: number;
    missed: number;
    completion_rate: number;
    evaluations: IntentionEvaluation[];
    meta_insight: string;
}

export interface WeeklyReport {
    emotional_trends: {
        dominant_work_emotion: string;
        dominant_personal_emotion: string;
        volatility_index: number;
        insight: string;
    };
    learning_clusters: Array<{
        theme: string;
        frequency: number;
        implication: string;
    }>;
    intention_scorecard: IntentionScorecard | null;
    pattern_insights: string[];
    risk_flags: string[];
    recommendations: string[];
    life_balance_index: number;
    executive_summary: string;
}

export async function generateWeeklyDigest(forceRegenerate = false) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 });
    const end = endOfWeek(today, { weekStartsOn: 0 });
    const startDateStr = format(start, "yyyy-MM-dd");
    const endDateStr = format(end, "yyyy-MM-dd");

    // ── Guard: Check if report already exists for this week ──
    if (!forceRegenerate) {
        const { data: existing } = await supabase
            .from("weekly_reports")
            .select("metrics_json, week_start_date, week_end_date")
            .eq("user_id", user.id)
            .eq("week_start_date", startDateStr)
            .eq("week_end_date", endDateStr)
            .single();

        if (existing?.metrics_json) {
            return {
                success: true,
                report: existing.metrics_json as WeeklyReport,
                week_range: `${existing.week_start_date} to ${existing.week_end_date}`,
                cached: true,
            };
        }
    }

    // 1. Fetch all logs + reflections for this week
    const { data: logs, error: logsError } = await supabase
        .from("daily_logs")
        .select(`
            date,
            work_score,
            personal_score,
            reflections (
                type,
                learning,
                improvement,
                sentiment_tags
            )
        `)
        .eq("user_id", user.id)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: true });

    if (logsError) {
        console.error("Error fetching logs:", logsError);
        return { error: "Failed to fetch logs" };
    }

    if (!logs || logs.length === 0) {
        return { error: "No logs found for this week. Start logging to generate intelligence." };
    }

    // ── Guard: Minimum logs required ──
    if (logs.length < MIN_LOGS_REQUIRED) {
        return {
            error: `You need at least ${MIN_LOGS_REQUIRED} days of logs this week to generate intelligence. Currently logged: ${logs.length} day${logs.length === 1 ? "" : "s"}.`
        };
    }

    // 2. Fetch weekly intentions
    const { data: intentions } = await supabase
        .from("weekly_intentions")
        .select("id, text, category, status")
        .eq("user_id", user.id)
        .eq("week_start_date", startDateStr);

    // 3. Aggregate data into structured payload
    const dailyEntries: Array<{
        date: string;
        work_vibe: string;
        personal_vibe: string;
        work_score: number;
        personal_score: number;
        work_emotions: string[];
        personal_emotions: string[];
        work_learning: string;
        personal_learning: string;
        work_improvement: string;
        personal_improvement: string;
    }> = [];

    const workSentiments: string[] = [];
    const personalSentiments: string[] = [];

    const vibeLabel = (score: number, type: "work" | "personal") => {
        if (type === "work") {
            if (score <= 4) return "Tough Day";
            if (score <= 7) return "Steady";
            return "Crushing It";
        } else {
            if (score <= 4) return "Draining";
            if (score <= 7) return "Okay";
            return "Fulfilling";
        }
    };

    for (const log of logs) {
        const entry: any = {
            date: log.date,
            work_score: log.work_score || 6,
            personal_score: log.personal_score || 6,
            work_vibe: vibeLabel(log.work_score || 6, "work"),
            personal_vibe: vibeLabel(log.personal_score || 6, "personal"),
            work_emotions: [],
            personal_emotions: [],
            work_learning: "",
            personal_learning: "",
            work_improvement: "",
            personal_improvement: "",
        };

        for (const ref of (log.reflections || [])) {
            const r = ref as any;
            if (r.type === "work") {
                if (r.sentiment_tags) {
                    entry.work_emotions = r.sentiment_tags;
                    workSentiments.push(...r.sentiment_tags);
                }
                if (r.learning) entry.work_learning = r.learning;
                if (r.improvement) entry.work_improvement = r.improvement;
            } else if (r.type === "personal") {
                if (r.sentiment_tags) {
                    entry.personal_emotions = r.sentiment_tags;
                    personalSentiments.push(...r.sentiment_tags);
                }
                if (r.learning) entry.personal_learning = r.learning;
                if (r.improvement) entry.personal_improvement = r.improvement;
            }
        }

        dailyEntries.push(entry);
    }

    const weeklyPayload: any = {
        week_range: `${startDateStr} to ${endDateStr}`,
        days_logged: logs.length,
        scoring_system: "3-point vibe scale: 3 (Tough/Draining), 6 (Steady/Okay), 9 (Crushing It/Fulfilling)",
        daily_entries: dailyEntries,
        aggregated_sentiments: {
            work: [...new Set(workSentiments)],
            personal: [...new Set(personalSentiments)],
        },
    };

    // Include intentions if any exist
    if (intentions && intentions.length > 0) {
        weeklyPayload.weekly_intentions = intentions.map((i: any) => ({
            text: i.text,
            category: i.category,
        }));
    }

    // 4. Call Gemini with system prompt + structured data
    const userPrompt = `Analyze the following weekly behavioral data and return the structured JSON report.\n\n${JSON.stringify(weeklyPayload, null, 2)}`;

    try {
        const result = await model.generateContent([
            { text: INTELLIGENCE_SYSTEM_PROMPT },
            { text: userPrompt },
        ]);
        const response = result.response;
        const text = response.text();

        let reportData: WeeklyReport;
        try {
            reportData = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", text);
            return { error: "Failed to parse AI response" };
        }

        // 5. Write intention statuses back to DB
        if (reportData.intention_scorecard?.evaluations && intentions && intentions.length > 0) {
            for (const evaluation of reportData.intention_scorecard.evaluations) {
                // Match by text similarity
                const matchedIntention = intentions.find((i: any) =>
                    i.text.toLowerCase().includes(evaluation.intention.toLowerCase().slice(0, 20)) ||
                    evaluation.intention.toLowerCase().includes(i.text.toLowerCase().slice(0, 20))
                );
                if (matchedIntention) {
                    await supabase
                        .from("weekly_intentions")
                        .update({ status: evaluation.status })
                        .eq("id", (matchedIntention as any).id);
                }
            }
        }

        // 6. Persist report to DB
        await supabase
            .from("weekly_reports")
            .delete()
            .eq("user_id", user.id)
            .eq("week_start_date", startDateStr)
            .eq("week_end_date", endDateStr);

        const { error: saveError } = await supabase
            .from("weekly_reports")
            .insert({
                user_id: user.id,
                week_start_date: startDateStr,
                week_end_date: endDateStr,
                summary_text: reportData.executive_summary,
                metrics_json: reportData,
            });

        if (saveError) {
            console.error("Save Error:", saveError);
        }

        return {
            success: true,
            report: reportData,
            week_range: weeklyPayload.week_range,
        };
    } catch (error: any) {
        console.error("Gemini Error:", error);
        return { error: "Intelligence generation failed: " + error.message };
    }
}
