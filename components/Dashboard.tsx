'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUserData}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Account Balance Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">$</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Balance
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${totalBalance.toFixed(2)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Count Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">#</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Accounts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {accounts.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Member Since Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Member Since
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Form */}
          <div className="mt-8">
            <TransferForm 
              onTransferSuccess={handleTransferSuccess}
              currentBalance={totalBalance}
            />
          </div>

          {/* Account Details */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <div key={account.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Account #{account.id.slice(-8)}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Balance:</span>
                        <span className="text-lg font-semibold text-gray-900">
                          ${account.balance.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Created:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(account.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
            <TransactionsTable 
              transactions={accounts.flatMap(account => account.transactions)}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
