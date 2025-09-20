import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
}

const transporter = nodemailer.createTransport(emailConfig)

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const mailOptions = {
        from: `NextBank <${emailConfig.auth.user}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      }

      await transporter.sendMail(mailOptions)
      console.log(`Email sent successfully to ${to}`)
      return true
    } catch (error) {
      console.error('Email sending failed:', error)
      return false
    }
  }

  async sendLowBalanceAlert(userEmail: string, userName: string, balance: number): Promise<boolean> {
    const template = this.getLowBalanceTemplate(userName, balance)
    return this.sendEmail(userEmail, template)
  }

  async sendTransferNotification(
    userEmail: string, 
    userName: string, 
    amount: number, 
    recipientEmail: string,
    type: 'sent' | 'received'
  ): Promise<boolean> {
    const template = this.getTransferTemplate(userName, amount, recipientEmail, type)
    return this.sendEmail(userEmail, template)
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const template = this.getWelcomeTemplate(userName)
    return this.sendEmail(userEmail, template)
  }

  private getLowBalanceTemplate(userName: string, balance: number): EmailTemplate {
    const subject = 'Low Balance Alert - NextBank'
    const text = `
Hello ${userName},

Your NextBank account balance is currently $${balance.toFixed(2)}, which is below our recommended minimum threshold.

To avoid any service interruptions, please consider adding funds to your account.

You can:
- Transfer money from another account
- Set up automatic deposits
- Contact our support team for assistance

Thank you for banking with NextBank!

Best regards,
NextBank Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Balance Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .balance { font-size: 24px; font-weight: bold; color: #dc2626; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 NextBank</h1>
            <p>Low Balance Alert</p>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <div class="alert">
                <h3>⚠️ Low Balance Alert</h3>
                <p>Your account balance is currently: <span class="balance">$${balance.toFixed(2)}</span></p>
                <p>This is below our recommended minimum threshold.</p>
            </div>
            
            <p>To avoid any service interruptions, please consider:</p>
            <ul>
                <li>Transferring money from another account</li>
                <li>Setting up automatic deposits</li>
                <li>Contacting our support team for assistance</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">View Dashboard</a>
                <a href="${process.env.NEXTAUTH_URL}/transfer" class="button">Add Funds</a>
            </div>
            
            <p>Thank you for banking with NextBank!</p>
            <p>Best regards,<br>NextBank Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 NextBank. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    return { subject, text, html }
  }

  private getTransferTemplate(
    userName: string, 
    amount: number, 
    recipientEmail: string, 
    type: 'sent' | 'received'
  ): EmailTemplate {
    const isSent = type === 'sent'
    const subject = `Transfer ${isSent ? 'Sent' : 'Received'} - NextBank`
    
    const text = `
Hello ${userName},

${isSent ? 'You have successfully sent' : 'You have received'} $${amount.toFixed(2)} ${isSent ? 'to' : 'from'} ${recipientEmail}.

Transaction Details:
- Amount: $${amount.toFixed(2)}
- ${isSent ? 'Recipient' : 'Sender'}: ${recipientEmail}
- Date: ${new Date().toLocaleString()}
- Status: Completed

Thank you for using NextBank!

Best regards,
NextBank Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transfer ${isSent ? 'Sent' : 'Received'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .success { background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: ${isSent ? '#dc2626' : '#059669'}; }
        .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 NextBank</h1>
            <p>Transfer ${isSent ? 'Sent' : 'Received'}</p>
        </div>
        <div class="content">
            <h2>Hello ${userName},</h2>
            
            <div class="success">
                <h3>✅ Transfer ${isSent ? 'Sent' : 'Received'} Successfully</h3>
                <p>Amount: <span class="amount">$${amount.toFixed(2)}</span></p>
            </div>
            
            <div class="details">
                <h3>Transaction Details</h3>
                <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
                <p><strong>${isSent ? 'Recipient' : 'Sender'}:</strong> ${recipientEmail}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Status:</strong> Completed</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">View Dashboard</a>
                <a href="${process.env.NEXTAUTH_URL}/transactions" class="button">View Transactions</a>
            </div>
            
            <p>Thank you for using NextBank!</p>
            <p>Best regards,<br>NextBank Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 NextBank. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    return { subject, text, html }
  }

  private getWelcomeTemplate(userName: string): EmailTemplate {
    const subject = 'Welcome to NextBank!'
    
    const text = `
Welcome to NextBank, ${userName}!

Thank you for joining NextBank. We're excited to have you as a customer.

Your account has been successfully created and you can now:
- View your account balance
- Make instant transfers
- Chat with our AI assistant
- Access your transaction history

Get started by logging into your account and exploring our features.

If you have any questions, our AI assistant is available 24/7 to help you.

Welcome aboard!

Best regards,
NextBank Team
    `.trim()

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NextBank</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .welcome { background: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
        .features { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .feature { display: flex; align-items: center; margin: 10px 0; }
        .icon { font-size: 20px; margin-right: 10px; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏦 NextBank</h1>
            <p>Welcome to the future of banking!</p>
        </div>
        <div class="content">
            <div class="welcome">
                <h2>🎉 Welcome to NextBank, ${userName}!</h2>
                <p>Thank you for joining NextBank. We're excited to have you as a customer.</p>
            </div>
            
            <p>Your account has been successfully created and you can now:</p>
            
            <div class="features">
                <div class="feature">
                    <span class="icon">💰</span>
                    <span>View your account balance in real-time</span>
                </div>
                <div class="feature">
                    <span class="icon">💸</span>
                    <span>Make instant transfers to other users</span>
                </div>
                <div class="feature">
                    <span class="icon">💬</span>
                    <span>Chat with our AI assistant 24/7</span>
                </div>
                <div class="feature">
                    <span class="icon">📊</span>
                    <span>Access your complete transaction history</span>
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Get Started</a>
                <a href="${process.env.NEXTAUTH_URL}/chat" class="button">Try AI Assistant</a>
            </div>
            
            <p>If you have any questions, our AI assistant is available 24/7 to help you.</p>
            <p>Welcome aboard!</p>
            <p>Best regards,<br>NextBank Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 NextBank. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim()

    return { subject, text, html }
  }
}

export const emailService = EmailService.getInstance()
