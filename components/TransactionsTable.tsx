'use client'

interface Transaction {
  id: string
  type: string
  amount: number
  createdAt: string
}

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading?: boolean
}

export default function TransactionsTable({ transactions, isLoading = false }: TransactionsTableProps) {
  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit'
      case 'withdrawal':
        return 'Withdrawal'
      case 'transfer_in':
        return 'Transfer Received'
      case 'transfer_out':
        return 'Transfer Sent'
      default:
        return type
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '⬆️'
      case 'withdrawal':
        return '⬇️'
      case 'transfer_in':
        return '↗️'
      case 'transfer_out':
        return '↘️'
      default:
        return '💰'
    }
  }

  const getAmountColor = (amount: number) => {
    if (amount > 0) {
      return 'text-green-600'
    } else if (amount < 0) {
      return 'text-red-600'
    }
    return 'text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-6 py-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions</h3>
          <p className="text-gray-500">Your transaction history will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
        <p className="mt-1 text-sm text-gray-500">
          Showing the last {transactions.length} transactions
        </p>
      </div>
      <ul className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-lg">
                    {getTransactionIcon(transaction.type)}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {formatTransactionType(transaction.type)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className={`text-sm font-medium ${getAmountColor(transaction.amount)}`}>
                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
