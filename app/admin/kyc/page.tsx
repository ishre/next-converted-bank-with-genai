'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Badge
} from "@/components/ui/badge"
import {
  Button
} from "@/components/ui/button"
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar"
import {
  Input
} from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogTrigger
} from "@/components/ui/dialog"
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
  Skeleton
} from "@/components/ui/skeleton"
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert"
import {
  Search,
  Filter,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import KYCStatusBadge from '@/components/KYCStatusBadge'
import KYCReviewModal from '@/components/KYCReviewModal'

interface User {
  id: string
  name: string
  email: string
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  kycSubmittedAt: string
  kycApprovedAt?: string
  kycApprovedBy?: string
  kycRejectionReason?: string
  createdAt: string
  daysPending: number
}

interface KYCStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
}

export default function AdminKYCDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<KYCStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  useEffect(() => {
    fetchData()
  }, [statusFilter, currentPage, searchTerm])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [usersResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/kyc/pending?status=${statusFilter}&page=${currentPage}&search=${searchTerm}`),
        fetch('/api/admin/kyc/stats')
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
        setPagination(usersData.pagination)
      } else {
        setError('Failed to fetch users')
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (userId: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userToApproveId: userId,
          adminNotes
        })
      })

      if (response.ok) {
        await fetchData() // Refresh data
        alert('KYC approved successfully')
      } else {
        const errorData = await response.json()
        alert('Failed to approve KYC: ' + errorData.error)
      }
    } catch (error) {
      console.error('Approval failed:', error)
      alert('Failed to approve KYC')
    }
  }

  const handleReject = async (userId: string, reason: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/kyc/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userToRejectId: userId,
          rejectionReason: reason,
          adminNotes
        })
      })

      if (response.ok) {
        await fetchData() // Refresh data
        alert('KYC rejected successfully')
      } else {
        const errorData = await response.json()
        alert('Failed to reject KYC: ' + errorData.error)
      }
    } catch (error) {
      console.error('Rejection failed:', error)
      alert('Failed to reject KYC')
    }
  }

  const handleQuickApprove = async (userId: string) => {
    if (confirm('Are you sure you want to approve this KYC?')) {
      await handleApprove(userId)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">KYC Management</h1>
          <p className="text-muted-foreground">
            Review and manage customer identity verifications
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" onClick={() => setStatusFilter('PENDING')}>
              Pending ({stats?.pending || 0})
            </TabsTrigger>
            <TabsTrigger value="approved" onClick={() => setStatusFilter('APPROVED')}>
              Approved ({stats?.approved || 0})
            </TabsTrigger>
            <TabsTrigger value="rejected" onClick={() => setStatusFilter('REJECTED')}>
              Rejected ({stats?.rejected || 0})
            </TabsTrigger>
            <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
              All ({stats?.total || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter.toLowerCase()} className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={fetchData}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>KYC Requests</CardTitle>
                <CardDescription>
                  {statusFilter === 'PENDING' && 'Users awaiting verification approval'}
                  {statusFilter === 'APPROVED' && 'Users with approved verification'}
                  {statusFilter === 'REJECTED' && 'Users with rejected verification'}
                  {statusFilter === 'all' && 'All KYC requests'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Days Pending</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src="" alt={user.name} />
                                  <AvatarFallback>
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{formatDate(user.kycSubmittedAt)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(user.kycStatus)}
                                <KYCStatusBadge status={user.kycStatus} />
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">
                                {user.daysPending} day{user.daysPending !== 1 ? 's' : ''}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedUser(user)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Review
                                    </Button>
                                  </DialogTrigger>
                                  <KYCReviewModal
                                    user={user}
                                    isOpen={selectedUser?.id === user.id}
                                    onClose={() => setSelectedUser(null)}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                  />
                                </Dialog>

                                {user.kycStatus === 'PENDING' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleQuickApprove(user.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Quick Approve
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
