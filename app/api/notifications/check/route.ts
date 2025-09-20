import { NextRequest } from 'next/server'
import { checkNotifications } from '@/lib/notifications'
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/lib/error-handler'
import { withRateLimit, generalRateLimiter } from '@/lib/rate-limiter'
import { withCSRFProtection } from '@/lib/csrf'

async function checkNotificationsHandler(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await withRateLimit(generalRateLimiter, request)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }

  try {
    const result = await checkNotifications()
    
    if (result.success) {
      return createSuccessResponse(
        { message: result.message },
        'Notifications checked successfully'
      )
    } else {
      return createErrorResponse(
        result.message,
        'NOTIFICATION_CHECK_FAILED',
        500
      )
    }
  } catch (error) {
    console.error('Notification check error:', error)
    return createErrorResponse(
      'Failed to check notifications',
      'NOTIFICATION_ERROR',
      500
    )
  }
}

export const POST = withErrorHandling(withCSRFProtection(checkNotificationsHandler))
