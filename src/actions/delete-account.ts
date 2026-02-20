"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function deleteAccount() {
    try {
        // Step 1: Authenticate the user via the normal (anon) client
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: "Unauthorized" };

        // Step 2: Create an ADMIN client using the service_role key.
        // The service_role key BYPASSES Row Level Security entirely.
        // Without it, delete operations silently return 0 rows affected.
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
            return { error: "Server configuration error. Please contact support." };
        }

        const admin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // Step 3: Cascade delete ALL user data using the admin client.
        //
        // IMPORTANT: The database schema (SCHEMA.sql) defines these FK references:
        //   - public.users.id             → auth.users(id)   [NO CASCADE]
        //   - public.daily_logs.user_id   → auth.users(id)   [NO CASCADE]
        //   - public.reflections.user_id  → auth.users(id)   [NO CASCADE]
        //   - public.reflections.log_id   → public.daily_logs(id) [CASCADE]
        //   - public.weekly_reports.user_id → auth.users(id)  [NO CASCADE]
        //
        // ALL of these must be deleted BEFORE auth.admin.deleteUser() or
        // PostgreSQL will block the deletion with "Database error deleting user".
        //
        // Deletion order (children first, then parents):
        //   reflections → weekly_reports → weekly_intentions → daily_logs → users

        // 3a. Delete ALL reflections for this user (by user_id, not log_id)
        const { error: refError } = await admin
            .from("reflections")
            .delete()
            .eq("user_id", user.id);
        if (refError) console.error("Error deleting reflections:", refError);

        // 3b. Delete weekly reports
        const { error: wrError } = await admin
            .from("weekly_reports")
            .delete()
            .eq("user_id", user.id);
        if (wrError) console.error("Error deleting weekly_reports:", wrError);

        // 3c. Delete weekly intentions
        const { error: wiError } = await admin
            .from("weekly_intentions")
            .delete()
            .eq("user_id", user.id);
        if (wiError) console.error("Error deleting weekly_intentions:", wiError);

        // 3d. Delete daily logs
        const { error: dlError } = await admin
            .from("daily_logs")
            .delete()
            .eq("user_id", user.id);
        if (dlError) console.error("Error deleting daily_logs:", dlError);

        // 3e. Delete from public.users (the profile/settings table)
        // THIS IS THE CRITICAL ONE. public.users.id has a direct FK to auth.users(id)
        // without ON DELETE CASCADE. If this row isn't removed first, PostgreSQL
        // blocks the auth.users deletion entirely.
        const { error: profileError } = await admin
            .from("users")
            .delete()
            .eq("id", user.id);
        if (profileError) console.error("Error deleting public.users:", profileError);

        // 3f. Also try user_settings (in case it exists separately)
        await admin
            .from("user_settings")
            .delete()
            .eq("user_id", user.id)
            .then(() => { })
            .catch(() => { }); // Ignore if table doesn't exist

        // Step 4: Delete the auth identity from auth.users
        const { error: adminError } = await admin.auth.admin.deleteUser(user.id);
        if (adminError) {
            console.error("Failed to delete auth identity:", adminError);
            await supabase.auth.signOut();
            return { error: `Data wiped but auth identity failed to delete: ${adminError.message}` };
        }

        // Step 5: Sign the user out
        await supabase.auth.signOut();

        return { success: true };
    } catch (error: any) {
        console.error("deleteAccount critical error:", error);
        return { error: error.message || "Something went wrong during account deletion" };
    }
}
