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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const [pendingCount, approvedCount, rejectedCount, totalUsers] = await Promise.all([
      prisma.user.count({ where: { kycStatus: 'PENDING' } }),
      prisma.user.count({ where: { kycStatus: 'APPROVED' } }),
      prisma.user.count({ where: { kycStatus: 'REJECTED' } }),
      prisma.user.count()
    ])

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentApprovals = await prisma.user.count({
      where: {
        kycStatus: 'APPROVED',
        kycApprovedAt: {
          gte: sevenDaysAgo
        }
      }
    })

    const recentRejections = await prisma.user.count({
      where: {
        kycStatus: 'REJECTED',
        kycApprovedAt: {
          gte: sevenDaysAgo
        }
      }
    })

    return NextResponse.json({
      stats: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: totalUsers
      },
      recentActivity: {
        approvals: recentApprovals,
        rejections: recentRejections,
        period: '7 days'
      },
      approvalRate: totalUsers > 0 ? Math.round((approvedCount / totalUsers) * 100) : 0
    })
  } catch (error) {
    console.error('KYC stats fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
