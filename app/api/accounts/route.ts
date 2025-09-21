import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware headers (more secure than re-verifying token)
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    // Get user's accounts with transactions
    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Limit to last 50 transactions
          include: {
            sender: {
              select: { name: true, email: true }
            },
            receiver: {
              select: { name: true, email: true }
            }
          }
        }
      }
    })

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: 'No accounts found for user' },
        { status: 404 }
      )
    }

    // Calculate total balance
    const totalBalance = accounts.reduce((sum: number, account: any) => sum + Number(account.balance), 0)

    return NextResponse.json({
      accounts: accounts.map((account: any) => ({
        id: account.id,
        balance: Number(account.balance),
        createdAt: account.createdAt,
        transactions: account.transactions.map((transaction: any) => ({
          id: transaction.id,
          type: transaction.type,
          amount: Number(transaction.amount),
          description: transaction.description,
          senderName: transaction.senderName || transaction.sender?.name,
          receiverName: transaction.receiverName || transaction.receiver?.name,
          createdAt: transaction.createdAt
        }))
      })),
      totalBalance
    })
  } catch (error) {
    console.error('Account fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
