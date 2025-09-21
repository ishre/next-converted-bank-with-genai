'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { 
  Button 
} from "@/components/ui/button"
import { 
  Input 
} from "@/components/ui/input"
import { 
  ScrollArea 
} from "@/components/ui/scroll-area"
import { 
  Separator 
} from "@/components/ui/separator"
import { 
  Avatar, 
  AvatarFallback
} from "@/components/ui/avatar"
import { 
  Send, 
  Trash2, 
  Bot, 
  User, 
  Loader2,
  HelpCircle,
  Shield,
  CreditCard,
  ArrowRightLeft
} from "lucide-react"

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your NextBank assistant. How can I help you with your banking needs today?',
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          stream: false
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date(data.data.timestamp)
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorData = await response.json()
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorData.error || 'Unknown error'}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your NextBank assistant. How can I help you with your banking needs today?',
      timestamp: new Date()
    }])
  }

  const quickActions = [
    {
      label: 'Transfer limits',
      message: 'What are the transfer limits?',
      icon: ArrowRightLeft
    },
    {
      label: 'Check balance',
      message: 'How do I check my balance?',
      icon: CreditCard
    },
    {
      label: 'Security',
      message: 'Is my account secure?',
      icon: Shield
    },
    {
      label: 'Help',
      message: 'How do I make a transfer?',
      icon: HelpCircle
    }
  ]

  return (
    <Card className="flex flex-col h-full max-h-[700px]">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">NextBank Assistant</CardTitle>
              <CardDescription className="text-sm">
                Ask me anything about banking
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <Separator />

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.isStreaming && (
                      <div className="flex items-center mt-1">
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        <span className="text-xs opacity-70">Typing...</span>
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-muted">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Input Area */}
      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInputMessage(action.message)}
              className="h-8 text-xs"
              disabled={isLoading}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about banking..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}
