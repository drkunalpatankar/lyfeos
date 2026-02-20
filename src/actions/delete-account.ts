"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function deleteAccount() {
    try {
        // Step 1: Authenticate the user via the normal (anon) client
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Unauthorized" };

        // Step 2: Create an ADMIN client using the service_role key
        // This is REQUIRED because the anon key is subject to RLS (Row Level Security).
        // If RLS policies don't explicitly allow DELETE, all .delete() calls
        // silently succeed with 0 rows affected — the data stays untouched.
        // The service_role key BYPASSES RLS entirely.
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
            return { error: "Server configuration error. Please contact support." };
        }

        const admin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );

        // Step 3: Cascade delete ALL user data using the admin client
        // Order: reflections → weekly_reports → weekly_intentions → daily_logs → user_settings

        // 3a. Find all daily_log IDs for this user
        const { data: logs, error: logsError } = await admin
            .from("daily_logs")
            .select("id")
            .eq("user_id", user.id);

        if (logsError) console.error("Error fetching logs:", logsError);

        // 3b. Delete reflections linked to those logs
        if (logs && logs.length > 0) {
            const logIds = logs.map(l => l.id);
            const { error: refError } = await admin
                .from("reflections")
                .delete()
                .in("log_id", logIds);
            if (refError) console.error("Error deleting reflections:", refError);
        }

        // 3c. Delete weekly reports
        const { error: wrError } = await admin
            .from("weekly_reports")
            .delete()
            .eq("user_id", user.id);
        if (wrError) console.error("Error deleting weekly_reports:", wrError);

        // 3d. Delete weekly intentions
        const { error: wiError } = await admin
            .from("weekly_intentions")
            .delete()
            .eq("user_id", user.id);
        if (wiError) console.error("Error deleting weekly_intentions:", wiError);

        // 3e. Delete daily logs
        const { error: dlError } = await admin
            .from("daily_logs")
            .delete()
            .eq("user_id", user.id);
        if (dlError) console.error("Error deleting daily_logs:", dlError);

        // 3f. Delete user settings
        const { error: usError } = await admin
            .from("user_settings")
            .delete()
            .eq("user_id", user.id);
        if (usError) console.error("Error deleting user_settings:", usError);

        // Step 4: Delete the auth identity from auth.users
        const { error: adminError } = await admin.auth.admin.deleteUser(user.id);
        if (adminError) {
            console.error("Failed to delete auth identity:", adminError);
        }

        // Step 5: Sign the user out of the current session
        await supabase.auth.signOut();

        return { success: true };
    } catch (error: any) {
        console.error("deleteAccount critical error:", error);
        return { error: error.message || "Something went wrong during account deletion" };
    }
}
