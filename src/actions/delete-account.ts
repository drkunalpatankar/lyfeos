"use server";

import { createClient } from "@/lib/supabase/server";

export async function deleteAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Cascade delete all user data
    // Order matters: reflections → weekly_reports → weekly_intentions → daily_logs → user_settings

    // 1. Delete reflections (via daily_logs join)
    const { data: logs } = await supabase
        .from("daily_logs")
        .select("id")
        .eq("user_id", user.id);

    if (logs && logs.length > 0) {
        const logIds = logs.map(l => l.id);
        await supabase
            .from("reflections")
            .delete()
            .in("log_id", logIds);
    }

    // 2. Delete weekly reports
    await supabase
        .from("weekly_reports")
        .delete()
        .eq("user_id", user.id);

    // 3. Delete weekly intentions
    await supabase
        .from("weekly_intentions")
        .delete()
        .eq("user_id", user.id);

    // 4. Delete daily logs
    await supabase
        .from("daily_logs")
        .delete()
        .eq("user_id", user.id);

    // 5. Delete user settings
    await supabase
        .from("user_settings")
        .delete()
        .eq("user_id", user.id);

    // 6. Delete auth user (uses admin API — requires service role key or RPC)
    // Sign the user out — the auth user row stays (Supabase doesn't allow self-delete of auth.users from client)
    // We'll sign out and leave the auth shell. All data is gone.
    await supabase.auth.signOut();

    return { success: true };
}
