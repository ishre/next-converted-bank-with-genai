'use client'

import { useState, useEffect } from 'react'
import TransactionsTable from '@/components/TransactionsTable'
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
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  ArrowDownRight,
  ArrowRightLeft,
  Home
} from "lucide-react"
import Link from 'next/link'

interface Transaction {
  id: string
  type: string
  amount: number
  createdAt: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/accounts')
        if (response.ok) {
          const data = await response.json()
          const allTransactions = data.accounts.flatMap((account: { transactions: Transaction[] }) => account.transactions)
          setTransactions(allTransactions)
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground text-lg">
            View all your account transactions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <TransactionsTable transactions={transactions} isLoading={isLoading} />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
                <CardDescription>
                  Understanding different transaction types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Deposit</div>
                      <div className="text-xs text-muted-foreground">Money added to account</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Withdrawal</div>
                      <div className="text-xs text-muted-foreground">Money removed from account</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ArrowDownRight className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Transfer In</div>
                      <div className="text-xs text-muted-foreground">Money received from others</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Send className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Transfer Out</div>
                      <div className="text-xs text-muted-foreground">Money sent to others</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Navigate to other banking features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/transfer">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Make Transfer
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    View Dashboard
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
