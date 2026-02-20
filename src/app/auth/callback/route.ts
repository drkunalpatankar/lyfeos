import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // BUGFIX: Next.js NextResponse.redirect() is infamous for dropping Set-Cookie headers 
            // set by cookies() in route handlers. To guarantee the session cookie is saved on the browser,
            // we return a standard 200 OK response with an HTML meta refresh.
            const html = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta http-equiv="refresh" content="0;url=${next}">
                        <title>Authenticating...</title>
                    </head>
                    <body style="background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
                        <p>Authenticating securely... redirecting you now.</p>
                        <script>
                            window.location.replace("${next}");
                        </script>
                    </body>
                </html>
            `

            return new NextResponse(html, {
                status: 200,
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                },
            });
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
