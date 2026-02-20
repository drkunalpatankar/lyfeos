"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfWeek, format } from "date-fns";

export interface Intention {
    id: string;
    text: string;
    category: "work" | "personal";
    status: "pending" | "achieved" | "partial" | "missed";
    week_start_date: string;
    created_at: string;
}

function getCurrentWeekStart() {
    return format(startOfWeek(new Date(), { weekStartsOn: 0 }), "yyyy-MM-dd");
}

export async function getWeeklyIntentions(): Promise<{ intentions?: Intention[]; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const weekStart = getCurrentWeekStart();

    const { data, error } = await supabase
        .from("weekly_intentions")
        .select("*")
        .eq("user_id", user.id)
        .eq("week_start_date", weekStart)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error fetching intentions:", error);
        return { error: "Failed to fetch intentions" };
    }

    return { intentions: data as Intention[] };
}

export async function addIntention({ text, category }: { text: string; category: "work" | "personal" }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const weekStart = getCurrentWeekStart();

    // Enforce max 5 intentions per week
    const { count } = await supabase
        .from("weekly_intentions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("week_start_date", weekStart);

    if ((count || 0) >= 5) {
        return { error: "Maximum 5 intentions per week. Focus is power." };
    }

    const { data, error } = await supabase
        .from("weekly_intentions")
        .insert({
            user_id: user.id,
            week_start_date: weekStart,
            text: text.trim(),
            category,
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding intention:", error);
        return { error: "Failed to add intention" };
    }

    return { intention: data as Intention };
}

export async function deleteIntention(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from("weekly_intentions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        console.error("Error deleting intention:", error);
        return { error: "Failed to delete intention" };
    }

    return { success: true };
}

export async function updateIntentionStatuses(
    statuses: Array<{ id: string; status: "achieved" | "partial" | "missed" }>
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    for (const s of statuses) {
        await supabase
            .from("weekly_intentions")
            .update({ status: s.status })
            .eq("id", s.id)
            .eq("user_id", user.id);
    }

    return { success: true };
}
