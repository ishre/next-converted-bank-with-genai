'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { 
  Button 
} from "@/components/ui/button"
import { 
  Input 
} from "@/components/ui/input"
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert"
import { 
  Progress 
} from "@/components/ui/progress"
import { 
  Separator 
} from "@/components/ui/separator"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  IndianRupee
} from "lucide-react"

interface TransferFormProps {
  onTransferSuccess: () => void
  currentBalance: number
}

const transferSchema = z.object({
  recipientEmail: z.string().email('Please enter a valid email address'),
  recipientAccountNumber: z.string().optional(),
  amount: z.string().min(1, 'Amount is required').refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Amount must be greater than 0'),
  description: z.string().optional(),
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits').optional(),
  password: z.string().min(6, 'Password is required').optional()
})

type TransferFormValues = z.infer<typeof transferSchema>

export default function TransferForm({ onTransferSuccess, currentBalance }: TransferFormProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientEmail: '',
      recipientAccountNumber: '',
      amount: '',
      description: '',
      otp: '',
      password: '',
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: TransferFormValues) => {
    console.log('Transfer submit invoked. Step:', step, 'Data:', { recipientEmail: data.recipientEmail, amount: data.amount })
    setIsLoading(true)
    setErrors([])
    setSuccessMessage('')

    try {
      if (step === 1) {
        const res = await fetch('/api/transfers/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: data.recipientEmail,
            recipientAccountNumber: data.recipientAccountNumber,
            amount: data.amount,
            description: data.description,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          setErrors([json.error || 'Failed to initiate transfer'])
        } else {
          setChallengeId(json.challengeId)
          setStep(2)
          setIsModalOpen(true)
        }
      } else if (step === 2) {
        if (!challengeId) {
          setErrors(['Missing challenge. Please restart.'])
        } else if (!data.otp) {
          setErrors(['Enter the OTP sent to your email'])
        } else {
          setStep(3)
        }
      } else if (step === 3) {
        if (!challengeId) {
          setErrors(['Missing challenge. Please restart.'])
        } else if (!data.password || !data.otp) {
          setErrors(['Enter OTP and password'])
        } else {
          const res = await fetch('/api/transfers/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengeId, otp: data.otp, password: data.password }),
          })
          const json = await res.json()
          if (!res.ok) {
            setErrors([json.error || 'Transfer failed'])
          } else {
            setSuccessMessage(`Transfer of ₹${json.transfer.amount} to ${data.recipientEmail} completed successfully!`)
            form.reset()
            setStep(1)
            setChallengeId(null)
            setIsModalOpen(false)
            onTransferSuccess()
          }
        }
      }
    } catch {
      setErrors(['Network error. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    form.reset()
    setErrors([])
    setSuccessMessage('')
    setStep(1)
    setChallengeId(null)
    setIsModalOpen(false)
  }

  const amount = form.watch('amount')
  const recipientEmail = form.watch('recipientEmail')
  const progress = step === 1
    ? ((recipientEmail ? 1 : 0) + (amount ? 1 : 0)) * 25
    : step === 2
    ? 75
    : 100

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Transfer Funds</span>
        </CardTitle>
        <CardDescription>
          Send money to friends and family instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transfer Progress</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="recipientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter recipient's email address"
                          type="email"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipientAccountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Account Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Account ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={currentBalance}
                            className="pl-10"
                            required
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Available balance: ₹{currentBalance.toFixed(2)}
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add a note for this transfer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {successMessage && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={() => onSubmit(form.getValues() as any)}
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {step === 1 ? 'Send OTP' : step === 2 ? 'Continue' : 'Confirm Transfer'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* OTP/Password Modal */}
        <Form {...form}>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>{step === 2 ? 'Enter OTP' : 'Confirm Transfer'}</DialogTitle>
              <DialogDescription>
                {step === 2 ? 'We have sent a 6-digit code to your email.' : 'Enter your account password to complete the transfer.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="6-digit code" maxLength={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => onSubmit(form.getValues() as any)}
                      disabled={isLoading || !form.getValues('otp')}
                    >
                      {isLoading ? 'Processing...' : 'Continue'}
                    </Button>
                  </DialogFooter>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={() => onSubmit(form.getValues() as any)}
                      disabled={isLoading || !form.getValues('otp') || !form.getValues('password')}
                    >
                      {isLoading ? 'Processing...' : 'Confirm Transfer'}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </div>
            </DialogContent>
          </Dialog>
        </Form>
      </CardContent>
    </Card>
  )
}
