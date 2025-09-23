import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTransferOtpEmail } from '@/lib/email'
import { createTransferChallenge } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientEmail, recipientAccountNumber, amount, description } = body

    if ((!recipientEmail && !recipientAccountNumber) || !amount) {
      return NextResponse.json({ error: 'Provide recipient email or account number, and an amount' }, { status: 400 })
    }
    const transferAmount = parseFloat(String(amount))
    if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    const sender = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } })
    if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 })

    // Resolve recipient by both account number and email when provided
    let recipientAccountId: string
    let recipientUserId: string
    let recipientName: string

    const senderAccount = await prisma.account.findFirst({ where: { userId } })
    if (!senderAccount) return NextResponse.json({ error: 'Sender account not found' }, { status: 404 })

    if (recipientAccountNumber) {
      const account = await prisma.account.findFirst({
        where: { OR: [ { accountNumber: recipientAccountNumber }, { id: recipientAccountNumber } ] },
        include: { user: true }
      })
      if (!account) return NextResponse.json({ error: 'Recipient account not found' }, { status: 404 })
      if (recipientEmail && account.user.email.toLowerCase() !== String(recipientEmail).toLowerCase().trim()) {
        return NextResponse.json({ error: 'Email does not match the account provided' }, { status: 400 })
      }
      recipientAccountId = account.id
      recipientUserId = account.userId
      recipientName = account.user.name
    } else {
      const recipientByEmail = await prisma.user.findUnique({ where: { email: String(recipientEmail).toLowerCase().trim() }, include: { accounts: true } })
      if (!recipientByEmail) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
      if (!recipientByEmail.accounts.length) return NextResponse.json({ error: 'Recipient has no accounts' }, { status: 400 })
      recipientAccountId = recipientByEmail.accounts[0].id
      recipientUserId = recipientByEmail.id
      recipientName = recipientByEmail.name
    }

    // Prevent transferring to same exact account; allow future intra-user transfers between different accounts
    if (recipientUserId === userId && recipientAccountId === senderAccount.id) {
      return NextResponse.json({ error: 'Cannot transfer to your own account' }, { status: 400 })
    }

    if (Number(senderAccount.balance) < transferAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    const challengeId = uuidv4()
    const challenge = createTransferChallenge({
      id: challengeId,
      userId,
      recipientEmail: recipientEmail || undefined,
      recipientAccountId,
      amount: transferAmount,
      description
    })

    // Persist challenge (so it survives serverless restarts)
    try {
      await prisma.transferChallenge.create({
        data: {
          id: challenge.id,
          userId: challenge.userId,
          recipientEmail: challenge.recipientEmail,
          recipientAccountId: challenge.recipientAccountId!,
          amount: challenge.amount,
          description: challenge.description,
          otp: challenge.otp,
          expiresAt: new Date(challenge.expiresAt),
          verified: false
        }
      })
    } catch {
      // ignore if table not present; fallback to in-memory
    }

    const emailRes = await sendTransferOtpEmail(sender.email, sender.name, challenge.otp, transferAmount, recipientEmail || recipientName)
    if (!emailRes.success) {
      return NextResponse.json({ error: `Failed to send OTP email: ${emailRes.error || 'unknown error'}` }, { status: 500 })
    }

    return NextResponse.json({ message: 'OTP sent', challengeId })
  } catch (error) {
    console.error('Initiate transfer error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
  }
}



