import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  [key: string]: string | number | boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log('Verifying token:', { 
      tokenPreview: token.substring(0, 20) + '...', 
      secretLength: JWT_SECRET.length,
      secretPreview: JWT_SECRET.substring(0, 10) + '...'
    })
    const { payload } = await jwtVerify(token, secret)
    const result = payload as JWTPayload
    console.log('Token verification successful:', { userId: result.userId })
    return result
  } catch (error) {
    console.log('Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export function getTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('token')?.value || null
}
