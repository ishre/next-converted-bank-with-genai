import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  userName: string
  pdfBuffer: Buffer
  startDate: Date
  endDate: Date
}

export async function sendStatementEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // Create transporter (using Gmail SMTP - you can configure this)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    })

    const { to, userName, pdfBuffer, startDate, endDate } = options

    const mailOptions = {
      from: process.env.EMAIL_USER || 'SecureDigital <noreply@securedigital.com>',
      to: to,
      subject: `SecureDigital Statement - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF7F11, #FF9F40); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">SecureDigital</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Account Statement</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your account statement for the period <strong>${startDate.toLocaleDateString()}</strong> to <strong>${endDate.toLocaleDateString()}</strong> 
              has been generated and is attached to this email.
            </p>
            
            
            
            
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Security Reminder</h4>
              <ul style="color: #856404; line-height: 1.6; margin: 10px 0;">
                <li>Never share your PDF password with anyone</li>
                <li>Delete this email after downloading the statement</li>
                <li>Store the PDF securely on your device</li>
                <li>Contact us immediately if you notice any suspicious activity</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-top: 30px;">
              If you have any questions about your statement or need assistance, please contact our support team.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:support@nextbank.com" style="background: #FF7F11; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Contact Support
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">SecureDigital - Secure Banking Solutions</p>
            <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `SecureDigital_Statement_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    }

    await transporter.sendMail(mailOptions)
    
    return { success: true }
  } catch (error) {
    console.error('Email sending error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function sendTransactionNotification(
  userEmail: string,
  userName: string,
  transaction: {
    type: string
    amount: number
    description?: string
    senderName?: string
    receiverName?: string
    createdAt: Date
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    })

    const { type, amount, description, senderName, receiverName, createdAt } = transaction
    
    let transactionDescription = description || ''
    if (type === 'transfer') {
      if (senderName && receiverName) {
        transactionDescription = `Transfer from ${senderName} to ${receiverName}`
      } else if (senderName) {
        transactionDescription = `Transfer from ${senderName}`
      } else if (receiverName) {
        transactionDescription = `Transfer to ${receiverName}`
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'SecureDigital <noreply@securedigital.com>',
      to: userEmail,
      subject: `Transaction Alert - ${type.charAt(0).toUpperCase() + type.slice(1)} of ₹${amount.toLocaleString('en-IN')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF7F11, #FF9F40); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">SecureDigital</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Transaction Notification</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
            
            <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #FF7F11; margin: 20px 0;">
              <h3 style="color: #FF7F11; margin-top: 0;">💰 Transaction Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Type:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Amount:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: bold;">₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Description:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${transactionDescription}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Date & Time:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${createdAt.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">🔔 Important</h4>
              <p style="color: #333; line-height: 1.6; margin: 10px 0;">
                If you did not authorize this transaction, please contact our support team immediately.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:support@nextbank.com" style="background: #FF7F11; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Contact Support
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: #fff; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">SecureDigital - Secure Banking Solutions</p>
            <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    
    return { success: true }
  } catch (error) {
    console.error('Transaction notification email error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Lightweight OTP email for transfer confirmation
export async function sendTransferOtpEmail(
  toEmail: string,
  userName: string,
  otpCode: string,
  amount: number,
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    })

    const mailOptions = {
      from: process.env.EMAIL_USER || 'SecureDigital <noreply@securedigital.com>',
      to: toEmail,
      subject: `Your SecureDigital OTP: ${otpCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF7F11, #FF9F40); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">SecureDigital</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Transfer Confirmation</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 16px;">Hello ${userName},</h2>
            <p style="color: #333; line-height: 1.6;">Use the One-Time Password below to confirm your transfer:</p>
            <div style="background:#fff; border-left:4px solid #FF7F11; padding:16px; margin:16px 0; border-radius:8px;">
              <div style="font-size: 28px; letter-spacing: 4px; font-weight: bold;">${otpCode}</div>
            </div>
            <p style="color:#666;">Amount: <strong>₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></p>
            <p style="color:#666;">Recipient: <strong>${recipientEmail}</strong></p>
            <p style="color:#666;">This OTP expires in 5 minutes. Do not share it with anyone.</p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}