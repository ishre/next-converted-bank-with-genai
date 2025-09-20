import { NextRequest, NextResponse } from 'next/server'
import { bankingChatbot } from '@/lib/gemini'
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/lib/error-handler'
import { withRateLimit, generalRateLimiter } from '@/lib/rate-limiter'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long')
    .trim(),
  stream: z.boolean().optional().default(false)
})

async function chatHandler(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await withRateLimit(generalRateLimiter, request)
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response!
  }

  const body = await request.json()
  
  // Validate input
  const validationResult = chatSchema.safeParse(body)
  if (!validationResult.success) {
    return createErrorResponse(
      'Invalid message format',
      'VALIDATION_ERROR',
      400,
      validationResult.error.issues
    )
  }

  const { message, stream } = validationResult.data

  try {
    if (stream) {
      // Return streaming response
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const generator = await bankingChatbot.streamMessage(message)
            
            for await (const chunk of generator) {
              const data = JSON.stringify(chunk) + '\n'
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
            
            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            const errorData = JSON.stringify({
              message: 'Error occurred while processing your request',
              timestamp: new Date(),
              isStreaming: false
            })
            controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
            controller.close()
          }
        }
      })

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Return regular response
      const response = await bankingChatbot.sendMessage(message)
      return createSuccessResponse(response, 'Message processed successfully')
    }
  } catch (error) {
    console.error('Chat error:', error)
    return createErrorResponse(
      'Failed to process message',
      'CHAT_ERROR',
      500
    )
  }
}

export const POST = withErrorHandling(chatHandler)
