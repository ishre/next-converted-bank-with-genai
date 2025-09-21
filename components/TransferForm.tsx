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
  amount: z.string().min(1, 'Amount is required').refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0
  }, 'Amount must be greater than 0'),
  description: z.string().optional()
})

type TransferFormValues = z.infer<typeof transferSchema>

export default function TransferForm({ onTransferSuccess, currentBalance }: TransferFormProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientEmail: '',
      amount: '',
      description: '',
    },
  })

  const onSubmit = async (data: TransferFormValues) => {
    setIsLoading(true)
    setErrors([])
    setSuccessMessage('')

    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (response.ok) {
        setSuccessMessage(`Transfer of ₹${responseData.transfer.amount} to ${responseData.transfer.recipientEmail} completed successfully!`)
        form.reset()
        onTransferSuccess() // Refresh account data
      } else {
        if (responseData.error) {
          setErrors([responseData.error])
        } else {
          setErrors(['Transfer failed. Please try again.'])
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
  }

  const amount = form.watch('amount')
  const recipientEmail = form.watch('recipientEmail')
  const progress = ((recipientEmail ? 1 : 0) + (amount ? 1 : 0)) * 50

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
                type="submit"
                disabled={isLoading || !recipientEmail || !amount}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Transfer
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
