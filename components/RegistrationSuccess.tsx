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
  Separator
} from "@/components/ui/separator"
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Mail,
  Phone,
  Shield
} from "lucide-react"
import KYCStatusBadge from './KYCStatusBadge'

interface RegistrationSuccessProps {
  userName: string
  userEmail: string
}

export default function RegistrationSuccess({ userName, userEmail }: RegistrationSuccessProps) {
  const [kycStatus, setKycStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simulate fetching KYC status
    // In real implementation, this would fetch from API
    setTimeout(() => {
      setKycStatus('PENDING')
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleContinue = () => {
    if (kycStatus === 'APPROVED') {
      router.push('/dashboard')
    } else {
      router.push('/kyc-status')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading your account...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Header */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Welcome to NextBank!</CardTitle>
            <CardDescription className="text-lg">
              Your account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">Account Status:</span>
                <KYCStatusBadge status={kycStatus} size="lg" />
              </div>
              <p className="text-sm text-muted-foreground">
                Hello <strong>{userName}</strong>, your account is ready but requires verification.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* KYC Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>KYC Verification Required</AlertTitle>
          <AlertDescription>
            To ensure the security of your account and comply with banking regulations, 
            we need to verify your identity. This process usually takes 24-48 hours.
          </AlertDescription>
        </Alert>

        {/* Timeline Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              What happens next?
            </CardTitle>
            <CardDescription>
              Here&apos;s what you can expect during the verification process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">Your NextBank account is ready</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium">Identity Verification</p>
                  <p className="text-sm text-muted-foreground">Our team reviews your information</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium">Full Access Granted</p>
                  <p className="text-sm text-muted-foreground">Start using all banking features</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Details */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>
              Your verification is currently in progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Verification Status</span>
                <KYCStatusBadge status={kycStatus} />
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Account Email</span>
                <span className="text-sm text-muted-foreground">{userEmail}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Expected Completion</span>
                <span className="text-sm text-muted-foreground">24-48 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Our support team is here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Email Support</p>
                  <p className="text-xs text-muted-foreground">support@nextbank.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Phone Support</p>
                  <p className="text-xs text-muted-foreground">+91 8000 123 456</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleContinue}
            className="flex-1"
          >
            {kycStatus === 'APPROVED' ? 'Go to Dashboard' : 'Check Status'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/kyc-status')}
            className="flex-1"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  )
}
