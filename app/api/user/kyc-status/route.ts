import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        kycStatus: true,
        kycSubmittedAt: true,
        kycApprovedAt: true,
        kycApprovedBy: true,
        kycRejectionReason: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      kycStatus: user.kycStatus,
      kycSubmittedAt: user.kycSubmittedAt,
      kycApprovedAt: user.kycApprovedAt,
      kycApprovedBy: user.kycApprovedBy,
      kycRejectionReason: user.kycRejectionReason,
      daysPending: user.kycStatus === 'PENDING' 
        ? Math.floor((Date.now() - new Date(user.kycSubmittedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0
    })
  } catch (error) {
    console.error('KYC status fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
