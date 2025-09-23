import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
}

// In-memory store for transfer OTP challenges (use Redis/db in production)
type TransferChallenge = {
  id: string
  userId: string
  recipientEmail: string
  recipientAccountId?: string
  amount: number
  description?: string
  otp: string
  expiresAt: number
  verified: boolean
}

const transferChallenges = new Map<string, TransferChallenge>()

export function generateNumericOtp(length: number = 6): string {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString()
  }
  return code
}

export function createTransferChallenge(params: {
  id: string
  userId: string
  recipientEmail: string
  recipientAccountId?: string
  amount: number
  description?: string
  ttlMs?: number
}): TransferChallenge {
  const otp = generateNumericOtp(6)
  const ttlMs = params.ttlMs ?? 5 * 60 * 1000
  const challenge: TransferChallenge = {
    id: params.id,
    userId: params.userId,
    recipientEmail: params.recipientEmail,
    recipientAccountId: params.recipientAccountId,
    amount: params.amount,
    description: params.description,
    otp,
    expiresAt: Date.now() + ttlMs,
    verified: false
  }
  transferChallenges.set(challenge.id, challenge)
  return challenge
}

export function getTransferChallenge(id: string): TransferChallenge | undefined {
  const ch = transferChallenges.get(id)
  if (!ch) return undefined
  if (Date.now() > ch.expiresAt) {
    transferChallenges.delete(id)
    return undefined
  }
  return ch
}

export function verifyTransferChallenge(id: string, otp: string): boolean {
  const ch = getTransferChallenge(id)
  if (!ch) return false
  if (ch.otp !== otp) return false
  ch.verified = true
  transferChallenges.set(id, ch)
  return true
}

export function revokeTransferChallenge(id: string): void {
  transferChallenges.delete(id)
}

// Generate a human-friendly 12-digit account number starting with 41
export function generateAccountNumber(): string {
  const prefix = '41' // bank code prefix
  let body = ''
  for (let i = 0; i < 10; i++) {
    body += Math.floor(Math.random() * 10).toString()
  }
  return prefix + body
}
