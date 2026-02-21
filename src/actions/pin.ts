"use server";

import { createClient } from "@/lib/supabase/server";

// Simple SHA-256 hash with salt
async function hashPin(pin: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}:${pin}`);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function checkPinStatus(): Promise<{ hasPin: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { hasPin: false, error: "Unauthorized" };

    const { data, error } = await supabase
        .from("users")
        .select("pin_hash")
        .eq("id", user.id)
        .single();

    if (error) return { hasPin: false, error: error.message };

    return { hasPin: !!data?.pin_hash };
}

export async function verifyPin(pin: string): Promise<{ valid: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { valid: false, error: "Unauthorized" };

    const { data, error } = await supabase
        .from("users")
        .select("pin_hash")
        .eq("id", user.id)
        .single();

    if (error || !data?.pin_hash) return { valid: false, error: "PIN not set" };

    const inputHash = await hashPin(pin, user.id);
    return { valid: inputHash === data.pin_hash };
}

export async function setPin(pin: string): Promise<{ success: boolean; error?: string }> {
    if (!/^\d{4}$/.test(pin)) {
        return { success: false, error: "PIN must be exactly 4 digits" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    const pinHash = await hashPin(pin, user.id);

    const { error } = await supabase
        .from("users")
        .update({ pin_hash: pinHash })
        .eq("id", user.id);

    if (error) return { success: false, error: error.message };

    return { success: true };
}

export async function changePin(currentPin: string, newPin: string): Promise<{ success: boolean; error?: string }> {
    // Verify current PIN first
    const { valid } = await verifyPin(currentPin);
    if (!valid) return { success: false, error: "Current PIN is incorrect" };

    // Set new PIN
    return setPin(newPin);
}
