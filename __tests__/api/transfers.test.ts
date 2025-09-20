import { POST } from '@/app/api/transfers/route'
import { prisma } from '@/lib/prisma'

// Mock the notification service
jest.mock('@/lib/notifications', () => ({
  notificationService: {
    sendTransferNotification: jest.fn(() => Promise.resolve(true))
  }
}))

describe('/api/transfers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should transfer funds successfully', async () => {
    const mockSender = {
      id: 'sender-1',
      email: 'sender@example.com',
      accounts: [{ id: 'sender-account', balance: 1000 }]
    }

    const mockRecipient = {
      id: 'recipient-1',
      email: 'recipient@example.com',
      accounts: [{ id: 'recipient-account', balance: 500 }]
    }

    const mockTransaction = {
      id: 'transaction-1',
      accountId: 'sender-account',
      type: 'transfer_out',
      amount: -100,
      createdAt: new Date()
    }

    ;(prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(mockRecipient) // First call for recipient lookup
      .mockResolvedValueOnce(mockSender) // Second call for sender lookup

    ;(prisma.account.findFirst as jest.Mock).mockResolvedValue({
      id: 'sender-account',
      userId: 'sender-1',
      balance: 1000
    })

    ;(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback({
        account: {
          update: jest.fn().mockResolvedValue({ id: 'sender-account', balance: 900 })
        },
        transaction: {
          create: jest.fn().mockResolvedValue(mockTransaction)
        }
      })
    })

    const request = new Request('http://localhost:3000/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'sender-1'
      },
      body: JSON.stringify({
        recipientEmail: 'recipient@example.com',
        amount: 100
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Transfer completed successfully')
    expect(data.transfer.amount).toBe(100)
    expect(data.transfer.recipientEmail).toBe('recipient@example.com')
    expect(data.newBalance).toBe(900)
  })

  it('should return 401 when no user ID provided', async () => {
    const request = new Request('http://localhost:3000/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientEmail: 'recipient@example.com',
        amount: 100
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('No authentication token provided')
  })

  it('should return 400 when recipient not found', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'sender-1'
      },
      body: JSON.stringify({
        recipientEmail: 'nonexistent@example.com',
        amount: 100
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Recipient not found')
  })

  it('should return 400 when transferring to self', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      accounts: [{ id: 'account-1', balance: 1000 }]
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

    const request = new Request('http://localhost:3000/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-1'
      },
      body: JSON.stringify({
        recipientEmail: 'user@example.com',
        amount: 100
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Cannot transfer to yourself')
  })

  it('should return 400 when insufficient balance', async () => {
    const mockRecipient = {
      id: 'recipient-1',
      email: 'recipient@example.com',
      accounts: [{ id: 'recipient-account', balance: 500 }]
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockRecipient)
    ;(prisma.account.findFirst as jest.Mock).mockResolvedValue({
      id: 'sender-account',
      userId: 'sender-1',
      balance: 50 // Insufficient balance
    })

    const request = new Request('http://localhost:3000/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'sender-1'
      },
      body: JSON.stringify({
        recipientEmail: 'recipient@example.com',
        amount: 100
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Insufficient balance')
  })

  it('should return 400 for invalid amount', async () => {
    const request = new Request('http://localhost:3000/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'sender-1'
      },
      body: JSON.stringify({
        recipientEmail: 'recipient@example.com',
        amount: -50 // Invalid negative amount
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Amount must be a positive number')
  })

  it('should return 400 for amount below minimum', async () => {
    const request = new Request('http://localhost:3000/api/transfers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'sender-1'
      },
      body: JSON.stringify({
        recipientEmail: 'recipient@example.com',
        amount: 0.005 // Below minimum
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Minimum transfer amount is $0.01')
  })
})
