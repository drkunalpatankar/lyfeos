import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Force domain normalization: redirect www.lyfeos.in to lyfeos.in
    // This is CRITICAL to prevent Supabase OAuth redirect mismatch bugs and cookie dropping.
    if (request.nextUrl.hostname === 'www.lyfeos.in') {
        const url = request.nextUrl.clone()
        url.hostname = 'lyfeos.in'
        return NextResponse.redirect(url, { status: 308 })
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
