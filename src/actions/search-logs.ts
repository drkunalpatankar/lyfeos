"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResult {
    id: string;
    date: string;
    work_score: number;
    personal_score: number;
    transcript: string;
    reflections?: {
        id: string;
        type: "work" | "personal";
        learning: string;
        improvement: string;
        sentiment_tags: string[];
    }[];
}

export async function searchLogs(query: string): Promise<{ data: SearchResult[]; error?: string }> {
    if (!query || query.trim().length < 2) {
        return { data: [], error: "Search query must be at least 2 characters" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { data: [], error: "Unauthorized" };

    // Convert user query into tsquery format
    // Split words and join with & (AND) for more precise results
    const tsQuery = query
        .trim()
        .split(/\s+/)
        .filter(w => w.length > 0)
        .map(w => `${w}:*`)  // prefix matching: "angio" matches "angioplasty"
        .join(" & ");

    const { data, error } = await supabase
        .from("daily_logs")
        .select(`
            id, date, work_score, personal_score, transcript,
            reflections (id, type, learning, improvement, sentiment_tags)
        `)
        .eq("user_id", user.id)
        .textSearch("fts", tsQuery)
        .order("date", { ascending: false })
        .limit(20);

    if (error) {
        console.error("Search error:", error);
        // Fallback to ILIKE if tsvector column doesn't exist yet
        const { data: fallbackData, error: fallbackError } = await supabase
            .from("daily_logs")
            .select(`
                id, date, work_score, personal_score, transcript,
                reflections (id, type, learning, improvement, sentiment_tags)
            `)
            .eq("user_id", user.id)
            .ilike("transcript", `%${query.trim()}%`)
            .order("date", { ascending: false })
            .limit(20);

        if (fallbackError) {
            return { data: [], error: fallbackError.message };
        }
        return { data: (fallbackData as SearchResult[]) || [] };
    }

    return { data: (data as SearchResult[]) || [] };
}
