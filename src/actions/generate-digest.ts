"use server";

import { createClient } from "@/lib/supabase/server";
import { model, INTELLIGENCE_SYSTEM_PROMPT } from "@/lib/gemini";
import { startOfWeek, endOfWeek, format } from "date-fns";

export interface WeeklyReport {
    time_analysis: {
        work_percentage: number;
        imbalance_flag: boolean;
        insight: string;
    };
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
    pattern_insights: string[];
    risk_flags: string[];
    recommendations: string[];
    life_balance_index: number;
    executive_summary: string;
}

export async function generateWeeklyDigest() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 });
    const end = endOfWeek(today, { weekStartsOn: 0 });

    // 1. Fetch all logs + reflections for this week
    const { data: logs, error: logsError } = await supabase
        .from("daily_logs")
        .select(`
            date,
            work_hours,
            personal_hours,
            health_hours,
            sleep_hours,
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
        .gte("date", format(start, "yyyy-MM-dd"))
        .lte("date", format(end, "yyyy-MM-dd"))
        .order("date", { ascending: true });

    if (logsError) {
        console.error("Error fetching logs:", logsError);
        return { error: "Failed to fetch logs" };
    }

    if (!logs || logs.length === 0) {
        return { error: "No logs found for this week. Start logging to generate intelligence." };
    }

    // 2. Aggregate data into structured payload
    const workScores: number[] = [];
    const personalScores: number[] = [];
    const workSentiments: string[] = [];
    const personalSentiments: string[] = [];
    const workLearnings: string[] = [];
    const personalLearnings: string[] = [];
    const workImprovements: string[] = [];
    const personalImprovements: string[] = [];
    let totalWork = 0, totalPersonal = 0, totalHealth = 0, totalSleep = 0;

    for (const log of logs) {
        workScores.push(log.work_score || 0);
        personalScores.push(log.personal_score || 0);
        totalWork += Number(log.work_hours) || 0;
        totalPersonal += Number(log.personal_hours) || 0;
        totalHealth += Number(log.health_hours) || 0;
        totalSleep += Number(log.sleep_hours) || 0;

        for (const ref of (log.reflections || [])) {
            const r = ref as any;
            if (r.type === "work") {
                if (r.sentiment_tags) workSentiments.push(...r.sentiment_tags);
                if (r.learning) workLearnings.push(r.learning);
                if (r.improvement) workImprovements.push(r.improvement);
            } else if (r.type === "personal") {
                if (r.sentiment_tags) personalSentiments.push(...r.sentiment_tags);
                if (r.learning) personalLearnings.push(r.learning);
                if (r.improvement) personalImprovements.push(r.improvement);
            }
        }
    }

    const weeklyPayload = {
        week_range: `${format(start, "yyyy-MM-dd")} to ${format(end, "yyyy-MM-dd")}`,
        days_logged: logs.length,
        time_distribution: {
            total_work_hours: totalWork,
            total_personal_hours: totalPersonal,
            total_health_hours: totalHealth,
            total_sleep_hours: totalSleep,
        },
        daily_scores: {
            work_scores: workScores,
            personal_scores: personalScores,
        },
        sentiments: {
            work: [...new Set(workSentiments)],
            personal: [...new Set(personalSentiments)],
        },
        learnings: {
            work: workLearnings,
            personal: personalLearnings,
        },
        improvements: {
            work: workImprovements,
            personal: personalImprovements,
        },
    };

    // 3. Call Gemini with system prompt + structured data
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

        // 4. Persist to DB
        const startDateStr = format(start, "yyyy-MM-dd");
        const endDateStr = format(end, "yyyy-MM-dd");

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
            throw saveError;
        }

        // Also return the raw time data for the donut chart (client-side rendering)
        return {
            success: true,
            report: reportData,
            time_data: weeklyPayload.time_distribution,
            week_range: weeklyPayload.week_range,
        };
    } catch (error: any) {
        console.error("Gemini Error:", error);
        return { error: "Intelligence generation failed: " + error.message };
    }
}
