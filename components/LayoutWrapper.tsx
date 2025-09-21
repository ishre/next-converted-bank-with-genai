'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Card, 
  CardContent 
} from "@/components/ui/card"
import { 
  Loader2 
} from "lucide-react"
import Navigation from './Navigation'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Don't show navigation on login/register pages
  const hideNavigation = pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-lg font-semibold mb-2">Loading NextBank</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we initialize your banking experience...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && user && <Navigation user={user} />}
      {children}
    </div>
  )
}
