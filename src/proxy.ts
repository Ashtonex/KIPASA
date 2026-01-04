import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Get the authenticated user (Session data from JWT)
  const { data: { user } } = await supabase.auth.getUser()

  const isUrlProtected = request.nextUrl.pathname.startsWith('/account')
  const isUrlAdmin = request.nextUrl.pathname.startsWith('/admin')

  // 2. Handle Authentication: Redirect to login if no user session exists
  if (!user && (isUrlProtected || isUrlAdmin)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // 3. Handle Authorization: Verify Admin/Staff Roles
  if (user && isUrlAdmin) {
    const userRole = user.user_metadata?.role?.toLowerCase(); 
    
    // SAFEGUARD: Hardcoded Owner Email Bypass
    const isOwner = user.email === 'ashytana@gmail.com';

    // DEBUG: Logs to terminal to verify current session status
    console.log(`🔐 Access Attempt: User[${user.email}] Role[${userRole}] Path[${request.nextUrl.pathname}]`);

    // Only block if they aren't an admin, aren't staff, AND aren't the owner
    if (userRole !== 'admin' && userRole !== 'staff' && !isOwner) {
      console.warn(`🚫 Access Denied: User[${user.email}] attempted unauthorized admin access.`);
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static, _next/image, favicon.ico, and static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}