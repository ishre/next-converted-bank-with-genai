'use client'

import { useState, useEffect } from 'react'
import TransferForm from '@/components/TransferForm'
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
  Badge 
} from "@/components/ui/badge"
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert"
import { 
  Skeleton 
} from "@/components/ui/skeleton"
import { 
  CheckCircle, 
  Shield, 
  Home,
  History
} from "lucide-react"
import Link from 'next/link'

export default function TransferPage() {
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/accounts')
        if (response.ok) {
          const data = await response.json()
          setBalance(data.totalBalance)
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [])

  const handleTransferSuccess = () => {
    // Refresh balance after successful transfer
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/accounts')
        if (response.ok) {
          const data = await response.json()
          setBalance(data.totalBalance)
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      }
    }
    fetchBalance()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Transfer Funds</h1>
          <p className="text-muted-foreground text-lg">
            Send money to other NextBank users instantly
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ) : (
              <TransferForm onTransferSuccess={handleTransferSuccess} currentBalance={balance} />
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Transfer Guidelines</span>
                </CardTitle>
                <CardDescription>
                  Important information about transfers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Minimum Transfer</span>
                    <Badge variant="outline">₹0.01</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maximum Transfer</span>
                    <Badge variant="outline">₹100,000</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Time</span>
                    <Badge variant="default">Instant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transfer Fees</span>
                    <Badge variant="secondary">No fees</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security</span>
                    <Badge variant="default">Bank-level</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Security Notice</p>
                  <p className="text-sm">
                    All transfers are protected by bank-level security. Never share your login credentials with anyone.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Navigate to other banking features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/transactions">
                    <History className="mr-2 h-4 w-4" />
                    View Transactions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
