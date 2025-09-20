import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  message: string
  timestamp: Date
  isStreaming?: boolean
}

const BANKING_SYSTEM_PROMPT = `You are a helpful banking assistant for NextBank. You can help users with:

1. Account balance inquiries
2. Transfer limits and policies
3. Transaction history questions
4. Security concerns
5. General banking FAQs
6. Account management help

Guidelines:
- Always be helpful and professional
- Provide accurate information about banking policies
- If you don't know something specific about NextBank, say so
- Keep responses concise but informative
- For security issues, always recommend contacting support
- Don't provide specific account numbers or sensitive data
- Be encouraging about financial responsibility

Current NextBank policies:
- Minimum transfer: $0.01
- Maximum transfer: $100,000
- No transfer fees
- Transfers are instant
- Account balance is updated in real-time
- All transactions are secure and encrypted

Remember: You're here to help users understand their banking options and answer questions about NextBank services.`

export class BankingChatbot {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any
  private chatHistory: ChatMessage[] = []

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      })

      // Prepare context with system prompt and chat history
      const context = this.buildContext()
      
      const result = await this.model.generateContent(context)
      const response = await result.response
      const text = response.text()

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: text,
        timestamp: new Date()
      })

      return {
        message: text,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      return {
        message: 'I apologize, but I\'m having trouble connecting to the banking system right now. Please try again later or contact our support team.',
        timestamp: new Date()
      }
    }
  }

  async streamMessage(userMessage: string): Promise<AsyncGenerator<ChatResponse, void, unknown>> {
    return this.streamResponse(userMessage)
  }

  private async *streamResponse(userMessage: string): AsyncGenerator<ChatResponse, void, unknown> {
    try {
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      })

      const context = this.buildContext()
      
      // For streaming, we'll simulate it by chunking the response
      const result = await this.model.generateContent(context)
      const response = await result.response
      const text = response.text()

      // Simulate streaming by sending chunks
      const words = text.split(' ')
      let currentMessage = ''
      
      for (let i = 0; i < words.length; i++) {
        currentMessage += (i > 0 ? ' ' : '') + words[i]
        
        yield {
          message: currentMessage,
          timestamp: new Date(),
          isStreaming: i < words.length - 1
        }
        
        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Add final response to history
      this.chatHistory.push({
        role: 'assistant',
        content: text,
        timestamp: new Date()
      })

    } catch (error) {
      console.error('Gemini streaming error:', error)
      yield {
        message: 'I apologize, but I\'m having trouble connecting to the banking system right now. Please try again later or contact our support team.',
        timestamp: new Date()
      }
    }
  }

  private buildContext(): string {
    let context = BANKING_SYSTEM_PROMPT + '\n\n'
    
    // Add recent chat history for context
    const recentHistory = this.chatHistory.slice(-10) // Last 10 messages
    for (const message of recentHistory) {
      context += `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}\n`
    }
    
    return context
  }

  clearHistory(): void {
    this.chatHistory = []
  }

  getHistory(): ChatMessage[] {
    return [...this.chatHistory]
  }
}

// Singleton instance
export const bankingChatbot = new BankingChatbot()
