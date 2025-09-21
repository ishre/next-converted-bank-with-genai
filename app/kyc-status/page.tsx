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
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert"
import {
  Badge
} from "@/components/ui/badge"
import {
  Button
} from "@/components/ui/button"
import {
  Progress
} from "@/components/ui/progress"
import {
  Separator
} from "@/components/ui/separator"
import {
  Skeleton
} from "@/components/ui/skeleton"
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  ArrowRight,
  RefreshCw,
  Home
} from "lucide-react"
import KYCStatusBadge from '@/components/KYCStatusBadge'

interface KYCStatusData {
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  kycSubmittedAt: string
  kycApprovedAt?: string
  kycApprovedBy?: string
  kycRejectionReason?: string
  daysPending: number
}

export default function KYCStatusPage() {
  const [kycData, setKycData] = useState<KYCStatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchKYCStatus()
  }, [])

  const fetchKYCStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/kyc-status')
      
      if (response.ok) {
        const data = await response.json()
        setKycData(data)
      } else {
        setError('Failed to fetch KYC status')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-8 h-8 text-yellow-600" />
      case 'APPROVED':
        return <CheckCircle className="w-8 h-8 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-8 h-8 text-red-600" />
      default:
        return <AlertCircle className="w-8 h-8 text-gray-600" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          title: 'Verification Under Review',
          description: 'Your KYC documents are being reviewed by our team. This usually takes 24-48 hours.',
          alertType: 'default' as const
        }
      case 'APPROVED':
        return {
          title: 'Verification Approved!',
          description: 'Congratulations! Your account has been verified and you now have full access to all features.',
          alertType: 'default' as const
        }
      case 'REJECTED':
        return {
          title: 'Verification Rejected',
          description: 'Unfortunately, your KYC verification was not approved. Please contact support for assistance.',
          alertType: 'destructive' as const
        }
      default:
        return {
          title: 'Unknown Status',
          description: 'Unable to determine your verification status. Please contact support.',
          alertType: 'destructive' as const
        }
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 50
      case 'APPROVED':
        return 100
      case 'REJECTED':
        return 0
      default:
        return 0
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !kycData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <CardTitle>Error Loading Status</CardTitle>
            <CardDescription>
              {error || 'Unable to load your KYC status'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchKYCStatus} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusMessage = getStatusMessage(kycData.kycStatus)
  const progressValue = getProgressValue(kycData.kycStatus)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">KYC Verification Status</h1>
          <p className="text-muted-foreground">
            Track your identity verification progress
          </p>
        </div>

        {/* Status Overview */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {getStatusIcon(kycData.kycStatus)}
            </div>
            <CardTitle className="text-2xl">{statusMessage.title}</CardTitle>
            <CardDescription className="text-lg">
              {statusMessage.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">Current Status:</span>
                <KYCStatusBadge status={kycData.kycStatus} size="lg" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status-specific content */}
        {kycData.kycStatus === 'PENDING' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Under Review</AlertTitle>
            <AlertDescription>
              Your verification has been pending for {kycData.daysPending} day{kycData.daysPending !== 1 ? 's' : ''}. 
              Our team is working to complete your verification as soon as possible.
            </AlertDescription>
          </Alert>
        )}

        {kycData.kycStatus === 'APPROVED' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Verification Complete</AlertTitle>
            <AlertDescription>
              Your account has been verified and approved by {kycData.kycApprovedBy} on{' '}
              {new Date(kycData.kycApprovedAt!).toLocaleDateString()}. You now have full access to all features.
            </AlertDescription>
          </Alert>
        )}

        {kycData.kycStatus === 'REJECTED' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Rejected</AlertTitle>
            <AlertDescription>
              {kycData.kycRejectionReason || 'Your verification was rejected. Please contact support for more information.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Details</CardTitle>
            <CardDescription>
              Information about your KYC verification process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <KYCStatusBadge status={kycData.kycStatus} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <p className="text-sm">
                    {new Date(kycData.kycSubmittedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {kycData.kycApprovedAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Approved</label>
                    <p className="text-sm">
                      {new Date(kycData.kycApprovedAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                
                {kycData.kycApprovedBy && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Approved By</label>
                    <p className="text-sm">{kycData.kycApprovedBy}</p>
                  </div>
                )}
              </div>
              
              {kycData.kycStatus === 'PENDING' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Days Pending</label>
                    <p className="text-2xl font-bold text-primary">{kycData.daysPending}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Our support team is available to assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">support@nextbank.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">+91 8000 123 456</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {kycData.kycStatus === 'APPROVED' ? (
            <Button 
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={fetchKYCStatus}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={() => router.push('/')}
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
