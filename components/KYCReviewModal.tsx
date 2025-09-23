'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Button
} from "@/components/ui/button"
import {
  Badge
} from "@/components/ui/badge"
import {
  Label
} from "@/components/ui/label"
import {
  Textarea
} from "@/components/ui/textarea"
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Separator
} from "@/components/ui/separator"
import {
  ScrollArea
} from "@/components/ui/scroll-area"
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  FileText,
  AlertTriangle
} from "lucide-react"
import KYCStatusBadge from './KYCStatusBadge'

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

interface KYCReviewModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onApprove: (userId: string, adminNotes?: string) => Promise<void>
  onReject: (userId: string, reason: string, adminNotes?: string) => Promise<void>
}

export default function KYCReviewModal({ 
  user, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject 
}: KYCReviewModalProps) {
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      await onApprove(user.id, adminNotes)
      onClose()
    } catch (error) {
      console.error('Approval failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    
    setIsProcessing(true)
    try {
      await onReject(user.id, rejectionReason, adminNotes)
      setShowRejectDialog(false)
      onClose()
    } catch (error) {
      console.error('Rejection failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              KYC Review - {user.name}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* User Profile Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="text-lg">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                          <p className="font-medium">{user.name}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                          <p className="text-sm">{formatDate(user.createdAt)}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">KYC Submitted</Label>
                          <p className="text-sm">{formatDate(user.kycSubmittedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    KYC Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Current Status</span>
                      <KYCStatusBadge status={user.kycStatus} size="lg" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Days Pending</Label>
                        <p className="text-2xl font-bold text-primary">{user.daysPending}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Submission Date</Label>
                        <p className="text-sm">{formatDate(user.kycSubmittedAt)}</p>
                      </div>
                    </div>

                    {user.kycStatus === 'REJECTED' && user.kycRejectionReason && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Previous Rejection Reason:</strong> {user.kycRejectionReason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">User ID</TableCell>
                        <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Email Verified</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Account Status</TableCell>
                        <TableCell>
                          <Badge variant="outline">Active</Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Registration IP</TableCell>
                        <TableCell className="text-muted-foreground">Not available</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Admin Notes Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="admin-notes">Add notes for this review</Label>
                    <Textarea
                      id="admin-notes"
                      placeholder="Add any notes about this KYC review..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {user.kycStatus === 'PENDING' && (
                <>
                  <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject KYC Verification</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please provide a reason for rejecting this KYC verification. 
                          The user will be notified of this decision.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="rejection-reason">Rejection Reason</Label>
                          <Select value={rejectionReason} onValueChange={setRejectionReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="insufficient_documents">Insufficient Documents</SelectItem>
                              <SelectItem value="invalid_information">Invalid Information</SelectItem>
                              <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
                              <SelectItem value="duplicate_account">Duplicate Account</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="rejection-details">Additional Details</Label>
                          <Textarea
                            id="rejection-details"
                            placeholder="Provide additional details about the rejection..."
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleReject}
                          disabled={!rejectionReason || isProcessing}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isProcessing ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            'Reject KYC'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button 
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {user.kycStatus === 'APPROVED' && (
                <div className="text-sm text-muted-foreground">
                  This KYC has already been approved
                </div>
              )}
              
              {user.kycStatus === 'REJECTED' && (
                <div className="text-sm text-muted-foreground">
                  This KYC has been rejected
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
