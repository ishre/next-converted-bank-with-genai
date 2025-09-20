'use client'

import { useState, useEffect } from 'react'
import TransactionsTable from '@/components/TransactionsTable'

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="mt-2 text-gray-600">View all your account transactions</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <TransactionsTable transactions={transactions} isLoading={isLoading} />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Types</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-green-500 mr-3">⬆️</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Deposit</div>
                    <div className="text-xs text-gray-500">Money added to account</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-red-500 mr-3">⬇️</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Withdrawal</div>
                    <div className="text-xs text-gray-500">Money removed from account</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-3">↗️</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Transfer In</div>
                    <div className="text-xs text-gray-500">Money received from others</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-orange-500 mr-3">↘️</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Transfer Out</div>
                    <div className="text-xs text-gray-500">Money sent to others</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/transfer"
                  className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Make Transfer
                </a>
                <a
                  href="/dashboard"
                  className="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  View Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
