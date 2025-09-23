'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  ScrollArea 
} from "@/components/ui/scroll-area"
import { 
  Separator 
} from "@/components/ui/separator"
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import TransferForm from './TransferForm'
import TransactionsTable from './TransactionsTable'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface Account {
  id: string
  accountNumber?: string
  balance: number
  createdAt: string
  transactions: Transaction[]
}

interface Transaction {
  id: string
  type: string
  amount: number
  createdAt: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    try {
      // Fetch user profile and accounts in parallel
      const [userResponse, accountsResponse] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/accounts')
      ])

      if (userResponse.ok && accountsResponse.ok) {
        const [userData, accountsData] = await Promise.all([
          userResponse.json(),
          accountsResponse.json()
        ])
        
        setUser(userData.user)
        setAccounts(accountsData.accounts)
        setTotalBalance(accountsData.totalBalance)
      } else if (userResponse.status === 401 || accountsResponse.status === 401) {
        // Redirect to login if not authenticated
        router.push('/login')
      } else {
        setError('Failed to load user data')
      }
    } catch {
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransferSuccess = () => {
    // Refresh account data after successful transfer
    fetchUserData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <RefreshCw className="h-12 w-12 animate-spin text-primary mb-4" />
            <CardTitle className="text-center">Loading your dashboard...</CardTitle>
            <CardDescription className="text-center mt-2">
              Please wait while we fetch your account information
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-center text-destructive">Error</CardTitle>
            <CardDescription className="text-center mt-2 mb-4">
              {error}
            </CardDescription>
            <Button onClick={fetchUserData} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const recentTransactions = accounts.flatMap(account => account.transactions)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground text-lg">
            Here&apos;s what&apos;s happening with your accounts today.
          </p>
          {accounts[0] && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Primary Account Number:</span>
              <span className="font-mono">{accounts[0].accountNumber || accounts[0].id}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(accounts[0].accountNumber || accounts[0].id)}
              >
                Copy
              </Button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +2.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
              <p className="text-xs text-muted-foreground">
                All accounts in good standing
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹12,234</div>
              <p className="text-xs text-muted-foreground">
                +15.3% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Transfer Form */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Quick Transfer</CardTitle>
                  <CardDescription>
                    Send money to friends and family instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransferForm 
                    onTransferSuccess={handleTransferSuccess}
                    currentBalance={totalBalance}
                  />
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {transaction.type === 'credit' ? (
                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <ArrowUpRight className="h-4 w-4 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {transaction.type === 'credit' ? 'Received' : 'Sent'} Money
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                transaction.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No recent transactions
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <Card key={account.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Account #{account.id.slice(-8)}</CardTitle>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{account.accountNumber || account.id}</span>
                          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(account.accountNumber || account.id)}>Copy</Button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <span className="text-2xl font-bold">₹{account.balance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm">
                          {new Date(account.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Transfer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  Complete transaction history for all your accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionsTable 
                  transactions={accounts.flatMap(account => account.transactions)}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
