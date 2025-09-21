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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Skeleton
} from "@/components/ui/skeleton"
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert"
import {
  Users,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Settings,
  UserCheck,
  UserX
} from "lucide-react"
import Link from 'next/link'

interface AdminStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

interface RecentActivity {
  approvals: number
  rejections: number
  period: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/kyc/stats')
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentActivity(data.recentActivity)
      } else if (response.status === 403) {
        setError('Admin access required')
        router.push('/dashboard')
      } else {
        setError('Failed to fetch admin data')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, KYC verifications, and system settings
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending KYC</p>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="kyc" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kyc">KYC Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="kyc" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  KYC Verification Management
                </CardTitle>
                <CardDescription>
                  Review and manage customer identity verifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Quick Actions</h3>
                      <div className="space-y-2">
                        <Button asChild className="w-full justify-start">
                          <Link href="/admin/kyc">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Review Pending KYC
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link href="/admin/kyc?status=approved">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            View Approved
                          </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                          <Link href="/admin/kyc?status=rejected">
                            <UserX className="mr-2 h-4 w-4" />
                            View Rejected
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Recent Activity</h3>
                      {recentActivity ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Approvals ({recentActivity.period})</span>
                            <span className="font-semibold text-green-600">{recentActivity.approvals}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Rejections ({recentActivity.period})</span>
                            <span className="font-semibold text-red-600">{recentActivity.rejections}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      )}
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> KYC verifications should be reviewed within 24-48 hours. 
                      Users cannot access their dashboard until verification is approved.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">User Statistics</h3>
                      {stats && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Total Users</span>
                            <span className="font-semibold">{stats.total}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Active Users</span>
                            <span className="font-semibold text-green-600">{stats.approved}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pending Verification</span>
                            <span className="font-semibold text-yellow-600">{stats.pending}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">User Actions</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <Users className="mr-2 h-4 w-4" />
                          View All Users
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <Settings className="mr-2 h-4 w-4" />
                          User Settings
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          User Analytics
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      User management features are coming soon. Currently, you can manage users through the KYC verification process.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Admin Settings
                </CardTitle>
                <CardDescription>
                  Configure system settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">System Settings</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <Settings className="mr-2 h-4 w-4" />
                          KYC Settings
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <Shield className="mr-2 h-4 w-4" />
                          Security Settings
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Analytics Settings
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Notifications</h3>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Email Settings
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          <Users className="mr-2 h-4 w-4" />
                          Alert Settings
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Advanced settings and configuration options will be available in future updates.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
