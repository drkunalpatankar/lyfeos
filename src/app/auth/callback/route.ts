import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        // Prepare the redirect URL, accounting for Vercel's load balancer
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        let redirectUrl = `${origin}${next}`;
        if (!isLocalEnv && forwardedHost) {
            redirectUrl = `https://${forwardedHost}${next}`;
        }

        // Create the redirect response FIRST
        const response = NextResponse.redirect(redirectUrl);

        // Create a custom Supabase client that writes directly to this specific response object
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // The crucial part: write the cookie directly to the redirect response
                            response.cookies.set({ name, value, ...options });
                        });
                    },
                },
            }
        );

        // Exchange the code for a session (this will trigger the setAll method above)
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Return the response that now contains the Set-Cookie headers
            return response;
        } else {
            console.error("Auth callback error:", error.message);
        }
    }

    // Return the user to login with an error
    return NextResponse.redirect(`${origin}/login?error=OAuth_Failed`);
}
