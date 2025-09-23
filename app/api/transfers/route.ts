import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTransactionNotification, sendTransferOtpEmail } from '@/lib/email'
import { createTransferChallenge } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

// Backward-compatible: direct POST still performs transfer (legacy). New flow uses
// POST /initiate to start and POST /confirm to finalize.
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
    const { recipientEmail, amount, description } = body

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

    // Get sender information
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    if (!sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
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
    const result = await prisma.$transaction(async (tx: any) => {
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
          type: 'transfer',
          amount: transferAmount,
          description: description || `Transfer to ${recipient.name}`,
          senderId: userId,
          receiverId: recipient.id,
          senderName: sender.name,
          receiverName: recipient.name
        }
      })

      // Create credit transaction for recipient
      const creditTransaction = await tx.transaction.create({
        data: {
          accountId: recipientAccount.id,
          type: 'transfer',
          amount: transferAmount,
          description: description || `Transfer from ${sender.name}`,
          senderId: userId,
          receiverId: recipient.id,
          senderName: sender.name,
          receiverName: recipient.name
        }
      })

      return {
        senderAccount: updatedSenderAccount,
        recipientAccount: updatedRecipientAccount,
        debitTransaction,
        creditTransaction
      }
    })

    // Send email notifications (don't wait for them to complete)
    Promise.all([
      sendTransactionNotification(sender.email, sender.name, {
        type: 'transfer',
        amount: transferAmount,
        description: description || `Transfer to ${recipient.name}`,
        senderName: sender.name,
        receiverName: recipient.name,
        createdAt: result.debitTransaction.createdAt
      }),
      sendTransactionNotification(recipient.email, recipient.name, {
        type: 'transfer',
        amount: transferAmount,
        description: description || `Transfer from ${sender.name}`,
        senderName: sender.name,
        receiverName: recipient.name,
        createdAt: result.creditTransaction.createdAt
      })
    ]).catch(error => {
      console.error('Failed to send transfer email notifications:', error)
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

// Initiate transfer: validate recipient by email and optional account number,
// create a challenge with OTP and email it to the sender. Returns challengeId.
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientEmail, recipientAccountNumber, amount, description } = body

    if (!recipientEmail || !amount) {
      return NextResponse.json({ error: 'Recipient email and amount are required' }, { status: 400 })
    }
    const transferAmount = parseFloat(String(amount))
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    const sender = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 })

    const recipient = await prisma.user.findUnique({ where: { email: recipientEmail }, include: { accounts: true } })
    if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    if (recipient.id === userId) return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })
    if (!recipient.accounts.length) return NextResponse.json({ error: 'Recipient has no accounts' }, { status: 400 })

    let recipientAccountId: string | undefined
    if (recipientAccountNumber) {
      const acct = recipient.accounts.find(a => a.accountNumber === recipientAccountNumber || a.id === recipientAccountNumber)
      if (!acct) return NextResponse.json({ error: 'Recipient account not found' }, { status: 404 })
      recipientAccountId = acct.id
    } else {
      recipientAccountId = recipient.accounts[0].id
    }

    const senderAccount = await prisma.account.findFirst({ where: { userId } })
    if (!senderAccount) return NextResponse.json({ error: 'Sender account not found' }, { status: 404 })
    if (Number(senderAccount.balance) < transferAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const challengeId = uuidv4()
    const challenge = createTransferChallenge({
      id: challengeId,
      userId,
      recipientEmail,
      recipientAccountId,
      amount: transferAmount,
      description
    })

    const emailRes = await sendTransferOtpEmail(sender.email, sender.name, challenge.otp, transferAmount, recipientEmail)
    if (!emailRes.success) {
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'OTP sent to your email. Please verify to continue.',
      challengeId
    })
  } catch (error) {
    console.error('Transfer initiate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
