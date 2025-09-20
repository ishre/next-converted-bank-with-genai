import { prisma } from './prisma'
import { emailService } from './email'

export interface NotificationRule {
  id: string
  userId: string
  type: 'low_balance' | 'transfer_received' | 'transfer_sent'
  threshold?: number
  enabled: boolean
  lastTriggered?: Date
}

export class NotificationService {
  private static instance: NotificationService

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async checkLowBalanceAlerts(): Promise<void> {
    try {
      console.log('Checking low balance alerts...')
      
      // Get all users with their accounts
      const users = await prisma.user.findMany({
        include: {
          accounts: true
        }
      })

      const lowBalanceThreshold = 100 // $100 threshold
      const alerts = []

      for (const user of users) {
        const totalBalance = user.accounts.reduce((sum, account) => sum + Number(account.balance), 0)
        
        if (totalBalance < lowBalanceThreshold) {
          // Check if we've already sent an alert recently (within 24 hours)
          const lastAlert = await this.getLastAlert(user.id, 'low_balance')
          const shouldSend = !lastAlert || 
            (new Date().getTime() - lastAlert.getTime()) > 24 * 60 * 60 * 1000

          if (shouldSend) {
            alerts.push({
              user,
              balance: totalBalance
            })
          }
        }
      }

      // Send alerts
      for (const alert of alerts) {
        await this.sendLowBalanceAlert(alert.user, alert.balance)
        await this.recordAlert(alert.user.id, 'low_balance')
      }

      console.log(`Processed ${alerts.length} low balance alerts`)
    } catch (error) {
      console.error('Error checking low balance alerts:', error)
    }
  }

  async sendLowBalanceAlert(user: { email: string; name: string }, balance: number): Promise<boolean> {
    try {
      const success = await emailService.sendLowBalanceAlert(user.email, user.name, balance)
      if (success) {
        console.log(`Low balance alert sent to ${user.email}`)
      }
      return success
    } catch (error) {
      console.error(`Failed to send low balance alert to ${user.email}:`, error)
      return false
    }
  }

  async sendTransferNotification(
    userId: string,
    amount: number,
    recipientEmail: string,
    type: 'sent' | 'received'
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        console.error(`User ${userId} not found for transfer notification`)
        return false
      }

      const success = await emailService.sendTransferNotification(
        user.email,
        user.name,
        amount,
        recipientEmail,
        type
      )

      if (success) {
        console.log(`Transfer notification sent to ${user.email}`)
      }

      return success
    } catch (error) {
      console.error(`Failed to send transfer notification:`, error)
      return false
    }
  }

  async sendWelcomeEmail(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        console.error(`User ${userId} not found for welcome email`)
        return false
      }

      const success = await emailService.sendWelcomeEmail(user.email, user.name)
      
      if (success) {
        console.log(`Welcome email sent to ${user.email}`)
      }

      return success
    } catch (error) {
      console.error(`Failed to send welcome email:`, error)
      return false
    }
  }

  private async getLastAlert(userId: string, type: string): Promise<Date | null> {
    // In a real implementation, you'd store this in a database
    // For now, we'll use a simple in-memory store
    const key = `${userId}_${type}`
    const stored = process.env[`ALERT_${key}`]
    return stored ? new Date(stored) : null
  }

  private async recordAlert(userId: string, type: string): Promise<void> {
    // In a real implementation, you'd store this in a database
    // For now, we'll use environment variables (not recommended for production)
    const key = `ALERT_${userId}_${type}`
    process.env[key] = new Date().toISOString()
  }

  async scheduleNotifications(): Promise<void> {
    // This would typically be called by a cron job or scheduled task
    await this.checkLowBalanceAlerts()
  }
}

export const notificationService = NotificationService.getInstance()

// API endpoint for manual notification checks
export async function checkNotifications(): Promise<{ success: boolean; message: string }> {
  try {
    await notificationService.scheduleNotifications()
    return {
      success: true,
      message: 'Notifications checked successfully'
    }
  } catch (error) {
    console.error('Notification check failed:', error)
    return {
      success: false,
      message: 'Failed to check notifications'
    }
  }
}
