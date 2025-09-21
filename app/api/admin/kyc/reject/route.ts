import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTransactionNotification } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // TODO: Add admin role check here

    const body = await request.json()
    const { userToRejectId, rejectionReason, adminNotes } = body

    if (!userToRejectId || !rejectionReason) {
      return NextResponse.json(
        { error: 'User ID and rejection reason are required' },
        { status: 400 }
      )
    }

    // Get admin user info
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Update user's KYC status
    const updatedUser = await prisma.user.update({
      where: { id: userToRejectId },
      data: {
        kycStatus: 'REJECTED',
        kycRejectionReason: rejectionReason
      },
      select: {
        id: true,
        name: true,
        email: true,
        kycStatus: true,
        kycRejectionReason: true
      }
    })

    // Send rejection notification email
    try {
      await sendTransactionNotification(updatedUser.email, updatedUser.name, {
        type: 'kyc_rejection',
        amount: 0,
        description: `Your KYC verification has been rejected. Reason: ${rejectionReason}. Please contact support for assistance.`,
        createdAt: new Date()
      })
    } catch (emailError) {
      console.error('Failed to send KYC rejection email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'KYC rejected successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('KYC rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
