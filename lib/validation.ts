export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2
}

export function validateRegisterData(data: RegisterData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!validateName(data.name)) {
    errors.push('Name must be at least 2 characters long')
  }
  
  if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address')
  }
  
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateLoginData(data: LoginData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address')
  }
  
  if (data.password.length === 0) {
    errors.push('Password is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
