import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { loginSchema } from '@/lib/validation-schemas'
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/lib/error-handler'
import { withRateLimit, loginRateLimiter } from '@/lib/rate-limiter'
import { addCSRFTokenToResponse } from '@/lib/csrf'

async function loginHandler(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await withRateLimit(loginRateLimiter, request)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }

  const body = await request.json()
  
  // Validate input data with Zod
  const validationResult = loginSchema.safeParse(body)
  if (!validationResult.success) {
    return createErrorResponse(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      validationResult.error.issues
    )
  }

  const { email, password } = validationResult.data

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      accounts: true
    }
  })

  if (!user) {
    return createErrorResponse(
      'Invalid email or password',
      'INVALID_CREDENTIALS',
      401
    )
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    return createErrorResponse(
      'Invalid email or password',
      'INVALID_CREDENTIALS',
      401
    )
  }

  // Generate JWT token
  const token = await generateToken({
    userId: user.id,
    email: user.email
  })

  // Create response with HttpOnly cookie
  const response = createSuccessResponse(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    },
    'Login successful'
  )

  // Set HttpOnly cookie
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })

  // Add CSRF token
  return addCSRFTokenToResponse(response, user.id)
}

export const POST = withErrorHandling(loginHandler)
