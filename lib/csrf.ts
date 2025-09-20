import { v4 as uuidv4 } from 'uuid'
import { NextRequest, NextResponse } from 'next/server'

// In-memory store for CSRF tokens (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expiresAt: number; userId?: string }>()

export interface CSRFToken {
  token: string
  expiresAt: number
}

export function generateCSRFToken(userId?: string): CSRFToken {
  const token = uuidv4()
  const expiresAt = Date.now() + (30 * 60 * 1000) // 30 minutes
  
  csrfTokens.set(token, {
    token,
    expiresAt,
    userId
  })
  
  // Clean up expired tokens
  cleanupExpiredTokens()
  
  return { token, expiresAt }
}

export function validateCSRFToken(token: string, userId?: string): boolean {
  const stored = csrfTokens.get(token)
  
  if (!stored) {
    return false
  }
  
  // Check if token is expired
  if (Date.now() > stored.expiresAt) {
    csrfTokens.delete(token)
    return false
  }
  
  // If userId is provided, verify it matches
  if (userId && stored.userId && stored.userId !== userId) {
    return false
  }
  
  return true
}

export function revokeCSRFToken(token: string): void {
  csrfTokens.delete(token)
}

export function revokeAllUserTokens(userId: string): void {
  for (const [token, data] of csrfTokens.entries()) {
    if (data.userId === userId) {
      csrfTokens.delete(token)
    }
  }
}

function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(token)
    }
  }
}

// Middleware to add CSRF token to response
export function addCSRFTokenToResponse(response: NextResponse, userId?: string): NextResponse {
  const { token } = generateCSRFToken(userId)
  
  response.cookies.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60, // 30 minutes
    path: '/'
  })
  
  return response
}

// Middleware to validate CSRF token from request
export function validateCSRFFromRequest(req: NextRequest, userId?: string): boolean {
  const token = req.headers.get('x-csrf-token') || req.cookies.get('csrf-token')?.value
  
  if (!token) {
    return false
  }
  
  return validateCSRFToken(token, userId)
}

// Get CSRF token from request
export function getCSRFTokenFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-csrf-token') || req.cookies.get('csrf-token')?.value || null
}

// CSRF protection middleware
export function withCSRFProtection(handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    // Skip CSRF for GET requests and public endpoints
    if (req.method === 'GET' || req.nextUrl.pathname.startsWith('/api/auth/login')) {
      return handler(req, ...args)
    }
    
    const userId = req.headers.get('x-user-id')
    const isValidCSRF = validateCSRFFromRequest(req, userId || undefined)
    
    if (!isValidCSRF) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID'
        },
        { status: 403 }
      )
    }
    
    return handler(req, ...args)
  }
}
