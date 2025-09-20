'use client'

import { useState, useEffect } from 'react'
import TransferForm from '@/components/TransferForm'

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
          <p className="mt-2 text-gray-600">Send money to other NextBank users</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : (
              <TransferForm onTransferSuccess={handleTransferSuccess} currentBalance={balance} />
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Guidelines</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Minimum transfer: $0.01
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Maximum transfer: $100,000
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Transfers are instant
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  No transfer fees
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Secure encryption
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Security Notice</h4>
              <p className="text-sm text-blue-700">
                All transfers are protected by bank-level security. Never share your login credentials with anyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
