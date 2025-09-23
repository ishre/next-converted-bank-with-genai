'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { 
  Input 
} from "@/components/ui/input"
import { 
  Button 
} from "@/components/ui/button"
import { 
  Badge 
} from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import { 
  Skeleton 
} from "@/components/ui/skeleton"
import { 
  Search, 
  ArrowUpDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Send, 
  Calendar,
  Download,
  Mail,
  Loader2,
  Eye
} from "lucide-react"
import { format } from 'date-fns'

interface Transaction {
  id: string
  type: string
  amount: number
  createdAt: string
  description?: string
  senderName?: string
  receiverName?: string
}

interface TransactionsTableProps {
  transactions: Transaction[]
  isLoading?: boolean
}

export default function TransactionsTable({ transactions: initialTransactions, isLoading = false }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [, setSelectedTransaction] = useState<Transaction | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [showStatementDialog, setShowStatementDialog] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    setTransactions(initialTransactions)
  }, [initialTransactions])

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit'
      case 'withdrawal':
        return 'Withdrawal'
      case 'transfer':
        return 'Transfer'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case 'transfer':
        return <Send className="h-4 w-4 text-blue-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'default'
      case 'withdrawal':
        return 'destructive'
      case 'transfer':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatAmount = (amount: number, type: string) => {
    const formatted = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    
    if (type === 'withdrawal' || type === 'transfer_out') {
      return `-₹${formatted}`
    }
    return `+₹${formatted}`
  }

  const getAmountColor = (type: string) => {
    if (type === 'withdrawal' || type === 'transfer_out') {
      return 'text-red-600'
    }
    return 'text-green-600'
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || transaction.type === filterType
    
    const matchesDateRange = 
      (!dateRange.start || new Date(transaction.createdAt) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(transaction.createdAt) <= new Date(dateRange.end))
    
    return matchesSearch && matchesType && matchesDateRange
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
    }
    return 0
  })

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage)

  const handleGenerateStatement = async () => {
    if (!dateRange.start || !dateRange.end) {
      alert('Please select both start and end dates')
      return
    }

    setIsGeneratingPDF(true)
    try {
      const response = await fetch('/api/transactions/statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: dateRange.start,
          endDate: dateRange.end,
          // Force direct download by omitting email entirely
        })
      })

      if (response.ok) {
        // Download the PDF directly
        const blob = await response.blob().catch(() => null)
        if (blob && blob.type === 'application/pdf') {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `SecureDigital_Statement_${dateRange.start}_to_${dateRange.end}.pdf`
          document.body.appendChild(link)
          link.click()
          link.remove()
          URL.revokeObjectURL(url)
          setShowStatementDialog(false)
        } else {
          alert('Unexpected response received while generating PDF.')
        }
      } else {
        const result = await response.json().catch(() => ({})) as any
        alert('Error generating statement: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error generating statement:', error)
      alert('Error generating statement. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSendEmail = async () => {
    if (!email) {
      alert('Please enter your email address')
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await fetch('/api/transactions/statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startDate: dateRange.start,
          endDate: dateRange.end,
          email: email
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert('Statement sent to your email successfully!')
        setShowStatementDialog(false)
      } else {
        const result = await response.json().catch(() => ({})) as any
        alert('Error sending statement: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error sending statement:', error)
      alert('Error sending statement. Please try again.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Transaction History</span>
              </CardTitle>
              <CardDescription>
                View and manage your transaction history
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowStatementDialog(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Generate Statement
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full sm:w-auto"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </Button>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setDateRange({ start: '', end: '' })}
                className="w-full sm:w-auto"
              >
                Clear Dates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>From/To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.type)}
                          <Badge variant={getTransactionBadgeVariant(transaction.type)}>
                            {formatTransactionType(transaction.type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="truncate font-medium">
                            {transaction.description || 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {transaction.type === 'transfer' ? (
                            <div className="text-sm">
                              {transaction.senderName && (
                                <p className="text-muted-foreground">From: {transaction.senderName}</p>
                              )}
                              {transaction.receiverName && (
                                <p className="text-muted-foreground">To: {transaction.receiverName}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground">-</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getAmountColor(transaction.type)}`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(transaction.createdAt), 'MMM dd, yyyy')}</p>
                          <p className="text-muted-foreground">
                            {format(new Date(transaction.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Transaction Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                                  <p className="font-medium">{formatTransactionType(transaction.type)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                  <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                                    {formatAmount(transaction.amount, transaction.type)}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                <p className="font-medium">{transaction.description || 'No description'}</p>
                              </div>
                              {transaction.senderName && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">From</label>
                                  <p className="font-medium">{transaction.senderName}</p>
                                </div>
                              )}
                              {transaction.receiverName && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">To</label>
                                  <p className="font-medium">{transaction.receiverName}</p>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                                <p className="font-medium">
                                  {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Statement Generation Dialog */}
      <Dialog open={showStatementDialog} onOpenChange={setShowStatementDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Statement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Removed password protection options */}
            
            <div className="flex space-x-2">
              <Button
                onClick={handleGenerateStatement}
                disabled={isGeneratingPDF || !dateRange.start || !dateRange.end}
                className="flex-1"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Generate PDF
              </Button>
              
              {email && (
                <Button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !dateRange.start || !dateRange.end}
                  variant="outline"
                  className="flex-1"
                >
                  {isSendingEmail ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Send Email
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}