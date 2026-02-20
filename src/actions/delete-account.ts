"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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

    // 6. Delete auth user (uses admin API)
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: adminError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (adminError) {
        console.error("Failed to delete auth identity:", adminError);
        // We still sign out because the public data was deleted
        await supabase.auth.signOut();
        return { error: "Failed to delete authentication identity, but public data was wiped." };
    }

    // Sign the user out of the current session
    await supabase.auth.signOut();

    return { success: true };
}
