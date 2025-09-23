import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTransferChallenge, revokeTransferChallenge, verifyTransferChallenge } from '@/lib/utils'
import { sendTransactionNotification } from '@/lib/email'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'No authentication token provided' }, { status: 401 })
    }

    const body = await request.json()
    const { challengeId, otp, password } = body
    if (!challengeId || typeof challengeId !== 'string') {
      return NextResponse.json({ error: 'challengeId is required' }, { status: 400 })
    }
    if (!otp || typeof otp !== 'string') {
      return NextResponse.json({ error: 'otp is required' }, { status: 400 })
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'password is required' }, { status: 400 })
    }

    let challenge = getTransferChallenge(challengeId)
    // Skip DB fallback on environments without the new Prisma client
    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found or expired' }, { status: 400 })
    }
    if (challenge.userId !== userId) {
      return NextResponse.json({ error: 'Challenge does not belong to user' }, { status: 403 })
    }

    // Verify OTP
    const ok = verifyTransferChallenge(challengeId, otp)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Verify password
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const passOk = await verifyPassword(password, user.password)
    if (!passOk) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Execute transfer
    const senderAccount = await prisma.account.findFirst({ where: { userId } })
    if (!senderAccount) return NextResponse.json({ error: 'Sender account not found' }, { status: 404 })
    if (Number(senderAccount.balance) < challenge.amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const recipient = await prisma.user.findUnique({ where: { email: challenge.recipientEmail }, include: { accounts: true } })
    if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    if (!recipient.accounts.length) return NextResponse.json({ error: 'Recipient has no accounts' }, { status: 400 })
    const recipientAccountId = challenge.recipientAccountId || recipient.accounts[0].id

    const sender = { name: user.name, email: user.email }

    const result = await prisma.$transaction(async (tx: any) => {
      const updatedSenderAccount = await tx.account.update({
        where: { id: senderAccount.id },
        data: { balance: { decrement: challenge.amount } }
      })

      const updatedRecipientAccount = await tx.account.update({
        where: { id: recipientAccountId },
        data: { balance: { increment: challenge.amount } }
      })

      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: senderAccount.id,
          type: 'transfer',
          amount: challenge.amount,
          description: challenge.description || `Transfer to ${recipient.name}`,
          senderId: userId,
          receiverId: recipient.id,
          senderName: sender.name,
          receiverName: recipient.name
        }
      })

      const creditTransaction = await tx.transaction.create({
        data: {
          accountId: recipientAccountId,
          type: 'transfer',
          amount: challenge.amount,
          description: challenge.description || `Transfer from ${sender.name}`,
          senderId: userId,
          receiverId: recipient.id,
          senderName: sender.name,
          receiverName: recipient.name
        }
      })

      return { updatedSenderAccount, updatedRecipientAccount, debitTransaction, creditTransaction }
    })

    // Cleanup challenge (in-memory only for compatibility)
    revokeTransferChallenge(challengeId)

    // Notifications (fire and forget)
    Promise.all([
      sendTransactionNotification(sender.email, sender.name, {
        type: 'transfer',
        amount: challenge.amount,
        description: challenge.description || `Transfer to ${recipient.name}`,
        senderName: sender.name,
        receiverName: recipient.name,
        createdAt: result.debitTransaction.createdAt
      }),
      sendTransactionNotification(recipient.email, recipient.name, {
        type: 'transfer',
        amount: challenge.amount,
        description: challenge.description || `Transfer from ${sender.name}`,
        senderName: sender.name,
        receiverName: recipient.name,
        createdAt: result.creditTransaction.createdAt
      })
    ]).catch(() => {})

    return NextResponse.json({
      message: 'Transfer completed successfully',
      transfer: {
        id: result.debitTransaction.id,
        amount: Number(result.debitTransaction.amount),
        recipientEmail: challenge.recipientEmail,
        timestamp: result.debitTransaction.createdAt
      },
      newBalance: Number(result.updatedSenderAccount.balance)
    })
  } catch (error) {
    console.error('Transfer confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


