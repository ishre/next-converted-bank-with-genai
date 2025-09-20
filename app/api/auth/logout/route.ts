import { NextRequest } from 'next/server'
import { withErrorHandling, createSuccessResponse } from '@/lib/error-handler'
import { withCSRFProtection } from '@/lib/csrf'
import { revokeAllUserTokens } from '@/lib/csrf'

async function logoutHandler(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  
  // Revoke all CSRF tokens for this user
  if (userId) {
    revokeAllUserTokens(userId)
  }

  const response = createSuccessResponse(
    { message: 'Logout successful' },
    'Logged out successfully'
  )

  // Clear the HttpOnly cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  })

  // Clear CSRF token cookie
  response.cookies.set('csrf-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  })

  return response
}

export const POST = withErrorHandling(withCSRFProtection(logoutHandler))
