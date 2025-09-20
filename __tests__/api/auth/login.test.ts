import { POST } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  verifyPassword: jest.fn(),
  generateToken: jest.fn()
}))

// Mock the rate limiter
jest.mock('@/lib/rate-limiter', () => ({
  withRateLimit: jest.fn(() => Promise.resolve({ allowed: true })),
  loginRateLimiter: {}
}))

// Mock CSRF protection
jest.mock('@/lib/csrf', () => ({
  withCSRFProtection: jest.fn((handler) => handler),
  addCSRFTokenToResponse: jest.fn((response) => response)
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      accounts: [{ id: 'account-1', balance: 1000 }]
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(verifyPassword as jest.Mock).mockResolvedValue(true)
    ;(generateToken as jest.Mock).mockResolvedValue('mock-jwt-token')

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.user.email).toBe('test@example.com')
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      include: { accounts: true }
    })
    expect(verifyPassword).toHaveBeenCalledWith('password123', 'hashed-password')
    expect(generateToken).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'test@example.com'
    })
  })

  it('should return 401 for invalid credentials', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid email or password')
  })

  it('should return 401 for wrong password', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      accounts: []
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(verifyPassword as jest.Mock).mockResolvedValue(false)

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong-password'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid email or password')
  })

  it('should return 400 for invalid email format', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 for missing password', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: ''
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.code).toBe('VALIDATION_ERROR')
  })
})
