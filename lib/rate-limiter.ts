import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string
}

export class RateLimiter {
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req: NextRequest) => {
        // Default key generator: IP + User-Agent + Endpoint
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
        const userAgent = req.headers.get('user-agent') || 'unknown'
        const endpoint = new URL(req.url).pathname
        return `${ip}:${userAgent}:${endpoint}`
      },
      ...config
    }
  }

  async checkLimit(req: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.config.keyGenerator(req)
    const now = Date.now()

    // Clean up expired entries
    this.cleanupExpiredEntries(now)

    const entry = rateLimitStore.get(key)

    if (!entry || entry.resetTime < now) {
      // First request or window expired
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      rateLimitStore.set(key, newEntry)
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime
      }
    }

    if (entry.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment counter
    entry.count++
    rateLimitStore.set(key, entry)

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  private cleanupExpiredEntries(now: number): void {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }

  getRemainingTime(key: string): number {
    const entry = rateLimitStore.get(key)
    if (!entry) return 0
    return Math.max(0, entry.resetTime - Date.now())
  }
}

// Pre-configured rate limiters
export const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  keyGenerator: (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    return `login:${ip}`
  }
})

export const generalRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
})

export const transferRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 transfers per hour
  keyGenerator: (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    return `transfer:${ip}`
  }
})

// Middleware function for rate limiting
export async function withRateLimit(
  rateLimiter: RateLimiter,
  req: NextRequest
): Promise<{ allowed: boolean; response?: NextResponse }> {
  const result = await rateLimiter.checkLimit(req)
  
  if (!result.allowed) {
    const response = new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(result.resetTime / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(result.resetTime / 1000).toString(),
          'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    )
    
    return { allowed: false, response }
  }

  return { allowed: true }
}
