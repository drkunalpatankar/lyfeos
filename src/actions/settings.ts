"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type Language = "en" | "hi";
export type Style = "normal" | "medical";

export interface UserSettings {
    voice_lang: Language;
    style: Style;
    theme?: string;
}

export async function updateSettings(settings: Partial<UserSettings>) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    // Fetch current settings to merge
    const { data: currentProfile } = await supabase
        .from("users")
        .select("settings")
        .eq("id", user.id)
        .single();

    const currentSettings = currentProfile?.settings || {};
    const newSettings = { ...currentSettings, ...settings };

    const { error } = await supabase
        .from("users")
        .update({ settings: newSettings })
        .eq("id", user.id);

    if (error) {
        console.error("Update Settings Error:", error);
        return { error: "Failed to update settings" };
    }

    revalidatePath("/");
    return { success: true };
}

export async function getSettings(): Promise<UserSettings> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { voice_lang: "en", style: "normal" };

    const { data } = await supabase
        .from("users")
        .select("settings")
        .eq("id", user.id)
        .single();

    return {
        voice_lang: "en",
        style: "normal",
        ...(data?.settings || {})
    } as UserSettings;
}
