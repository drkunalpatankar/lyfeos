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
        // Service role key bypasses RLS and is required for auth.admin.deleteUser().
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

        // Step 3: Delete the user from auth.users.
        // Because we added ON DELETE CASCADE to ALL foreign keys
        // (public.users, daily_logs, reflections, weekly_reports, weekly_intentions),
        // PostgreSQL will automatically cascade-delete ALL user data
        // from every public table when the auth.users row is removed.
        //
        // This is the cleanest and most reliable approach — one delete, zero orphans.
        const { error: adminError } = await admin.auth.admin.deleteUser(user.id);

        if (adminError) {
            console.error("Failed to delete user:", adminError);
            // Fallback: try to sign out at least
            await supabase.auth.signOut();
            return { error: `Failed to delete account: ${adminError.message}` };
        }

        // Step 4: Sign the user out of the current session
        await supabase.auth.signOut();

        return { success: true };
    } catch (error: any) {
        console.error("deleteAccount critical error:", error);
        return { error: error.message || "Something went wrong during account deletion" };
    }
}
