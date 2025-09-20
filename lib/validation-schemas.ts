import { z } from 'zod'

// User validation schemas
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
})

export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password must be less than 100 characters')
})

// Transfer validation schema
export const transferSchema = z.object({
  recipientEmail: z.string()
    .email('Please enter a valid recipient email address')
    .max(100, 'Email must be less than 100 characters'),
  amount: z.number()
    .positive('Amount must be positive')
    .min(0.01, 'Minimum transfer amount is $0.01')
    .max(100000, 'Maximum transfer amount is $100,000')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places')
})

// Transaction query validation
export const transactionQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  type: z.enum(['deposit', 'withdrawal', 'transfer_in', 'transfer_out']).optional()
}).refine(data => {
  if (data.page && (data.page < 1 || data.page > 1000)) {
    return false
  }
  if (data.limit && (data.limit < 1 || data.limit > 100)) {
    return false
  }
  return true
}, {
  message: 'Invalid pagination parameters'
})

// CSRF token validation
export const csrfTokenSchema = z.object({
  csrfToken: z.string()
    .min(1, 'CSRF token is required')
    .uuid('Invalid CSRF token format')
})

// Rate limiting validation
export const rateLimitSchema = z.object({
  ip: z.string().min(1),
  endpoint: z.string().min(1),
  timestamp: z.number().positive()
})

// Common validation helpers
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const result = z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/)
    .regex(/[!@#$%^&*(),.?":{}|<>]/)
    .safeParse(password)
  
  if (result.success) {
    return { isValid: true, errors: [] }
  }
  
  const errors: string[] = []
  if (password.length < 8) errors.push('Password must be at least 8 characters long')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter')
  if (!/\d/.test(password)) errors.push('Password must contain at least one number')
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character')
  
  return { isValid: false, errors }
}
