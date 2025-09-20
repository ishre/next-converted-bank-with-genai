import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notificationService } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware headers (more secure than re-verifying token)
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { recipientEmail, amount } = body

    // Validate input
    if (!recipientEmail || !amount) {
      return NextResponse.json(
        { error: 'Recipient email and amount are required' },
        { status: 400 }
      )
    }

    const transferAmount = parseFloat(amount)
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    if (transferAmount < 0.01) {
      return NextResponse.json(
        { error: 'Minimum transfer amount is $0.01' },
        { status: 400 }
      )
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
      include: { accounts: true }
    })

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    if (recipient.id === userId) {
      return NextResponse.json(
        { error: 'Cannot transfer to yourself' },
        { status: 400 }
      )
    }

    if (recipient.accounts.length === 0) {
      return NextResponse.json(
        { error: 'Recipient has no accounts' },
        { status: 400 }
      )
    }

    // Get sender's account
    const senderAccount = await prisma.account.findFirst({
      where: { userId }
    })

    if (!senderAccount) {
      return NextResponse.json(
        { error: 'Sender account not found' },
        { status: 404 }
      )
    }

    // Check if sender has sufficient balance
    if (Number(senderAccount.balance) < transferAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update sender's balance (debit)
      const updatedSenderAccount = await tx.account.update({
        where: { id: senderAccount.id },
        data: {
          balance: {
            decrement: transferAmount
          }
        }
      })

      // Update recipient's balance (credit)
      const recipientAccount = recipient.accounts[0] // Use first account
      const updatedRecipientAccount = await tx.account.update({
        where: { id: recipientAccount.id },
        data: {
          balance: {
            increment: transferAmount
          }
        }
      })

      // Create debit transaction for sender
      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: senderAccount.id,
          type: 'transfer_out',
          amount: -transferAmount // Negative amount for debit
        }
      })

      // Create credit transaction for recipient
      const creditTransaction = await tx.transaction.create({
        data: {
          accountId: recipientAccount.id,
          type: 'transfer_in',
          amount: transferAmount // Positive amount for credit
        }
      })

      return {
        senderAccount: updatedSenderAccount,
        recipientAccount: updatedRecipientAccount,
        debitTransaction,
        creditTransaction
      }
    })

    // Send notifications (don't wait for them to complete)
    Promise.all([
      notificationService.sendTransferNotification(userId, transferAmount, recipientEmail, 'sent'),
      notificationService.sendTransferNotification(recipient.id, transferAmount, recipientEmail, 'received')
    ]).catch(error => {
      console.error('Failed to send transfer notifications:', error)
    })

    return NextResponse.json({
      message: 'Transfer completed successfully',
      transfer: {
        id: result.debitTransaction.id,
        amount: transferAmount,
        recipientEmail,
        timestamp: result.debitTransaction.createdAt
      },
      newBalance: Number(result.senderAccount.balance)
    })
  } catch (error) {
    console.error('Transfer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
