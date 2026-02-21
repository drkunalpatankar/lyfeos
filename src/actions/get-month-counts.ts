"use server";

import { createClient } from "@/lib/supabase/server";

export interface MonthCount {
    month: string;  // "2026-01", "2026-02", etc.
    count: number;
}

export interface YearData {
    year: number;
    months: MonthCount[];
}

export async function getMonthCounts(): Promise<{ data: YearData[]; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { data: [], error: "Unauthorized" };

    // Get all log dates with a count per month
    const { data, error } = await supabase
        .from("daily_logs")
        .select("date")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

    if (error) return { data: [], error: error.message };

    // Group by year and month
    const yearMap = new Map<number, Map<string, number>>();

    for (const log of data || []) {
        const [yearStr, monthStr] = log.date.split("-");
        const year = parseInt(yearStr);
        const monthKey = `${yearStr}-${monthStr}`;

        if (!yearMap.has(year)) yearMap.set(year, new Map());
        const months = yearMap.get(year)!;
        months.set(monthKey, (months.get(monthKey) || 0) + 1);
    }

    // Convert to sorted array
    const result: YearData[] = [];
    const sortedYears = [...yearMap.keys()].sort((a, b) => b - a); // descending

    for (const year of sortedYears) {
        const monthsMap = yearMap.get(year)!;
        const months: MonthCount[] = [];

        // All 12 months for the year
        for (let m = 1; m <= 12; m++) {
            const monthKey = `${year}-${m.toString().padStart(2, "0")}`;
            months.push({
                month: monthKey,
                count: monthsMap.get(monthKey) || 0,
            });
        }

        result.push({ year, months });
    }

    return { data: result };
}
