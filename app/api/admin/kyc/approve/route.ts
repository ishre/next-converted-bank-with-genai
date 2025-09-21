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
    const { userToApproveId, adminNotes } = body

    if (!userToApproveId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
      where: { id: userToApproveId },
      data: {
        kycStatus: 'APPROVED',
        kycApprovedAt: new Date(),
        kycApprovedBy: adminUser.name
      },
      select: {
        id: true,
        name: true,
        email: true,
        kycStatus: true,
        kycApprovedAt: true
      }
    })

    // Send approval notification email
    try {
      await sendTransactionNotification(updatedUser.email, updatedUser.name, {
        type: 'kyc_approval',
        amount: 0,
        description: 'Your KYC verification has been approved! You now have full access to your NextBank account.',
        createdAt: new Date()
      })
    } catch (emailError) {
      console.error('Failed to send KYC approval email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'KYC approved successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('KYC approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
