import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getTokenFromCookies } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/transfer', '/transactions', '/chat']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // API routes that don't require authentication
  const publicApiRoutes = ['/api/auth/login', '/api/auth/register']
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

  // If it's a public route or API route, allow access
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next()
  }
  
  // If it's not a protected route, allow access
  if (!isProtectedRoute && !pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = getTokenFromCookies(request)
  console.log('Middleware check:', { pathname, hasToken: !!token, tokenPreview: token?.substring(0, 20) + '...' })
  
  if (!token) {
    // Redirect to login if no token
    console.log('No token found, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token
  const payload = await verifyToken(token)
  console.log('Token verification:', { hasPayload: !!payload, userId: payload?.userId })
  if (!payload) {
    // Redirect to login if token is invalid
    console.log('Invalid token, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Add user info to headers for API routes
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
