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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const whereClause: any = {}
    
    if (status !== 'all') {
      whereClause.kycStatus = status
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
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
        },
        orderBy: { kycSubmittedAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        daysPending: user.kycStatus === 'PENDING' 
          ? Math.floor((Date.now() - new Date(user.kycSubmittedAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Admin KYC pending fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
