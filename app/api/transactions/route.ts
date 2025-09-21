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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const whereClause: any = {
      account: {
        userId: userId
      }
    }

    // Add date range filter
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Add type filter
    if (type && type !== 'all') {
      whereClause.type = type
    }

    // Get transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          sender: {
            select: { name: true, email: true }
          },
          receiver: {
            select: { name: true, email: true }
          },
          account: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.transaction.count({
        where: whereClause
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      transactions: transactions.map((transaction: any) => ({
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        description: transaction.description,
        senderName: transaction.senderName || transaction.sender?.name,
        receiverName: transaction.receiverName || transaction.receiver?.name,
        createdAt: transaction.createdAt
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
    console.error('Transactions fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
