import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  userName: string
  pdfBuffer: Buffer
  startDate: Date
  endDate: Date
  password: string
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

    const { to, userName, pdfBuffer, startDate, endDate, password } = options

    const mailOptions = {
      from: process.env.EMAIL_USER || 'NextBank <noreply@nextbank.com>',
      to: to,
      subject: `NextBank Statement - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF7F11, #FF9F40); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">NextBank</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">Account Statement</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Your account statement for the period <strong>${startDate.toLocaleDateString()}</strong> to <strong>${endDate.toLocaleDateString()}</strong> 
              has been generated and is attached to this email.
            </p>
            
            <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #FF7F11; margin: 20px 0;">
              <h3 style="color: #FF7F11; margin-top: 0;">🔒 Security Information</h3>
              <p style="margin: 10px 0; color: #333;">
                <strong>PDF Password:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${password}</code>
              </p>
              <p style="margin: 10px 0; color: #666; font-size: 14px;">
                The PDF is password protected for your security. Use the password above to open the document.
              </p>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1976d2; margin-top: 0;">📋 Instructions to Open PDF:</h4>
              <ol style="color: #333; line-height: 1.6;">
                <li>Download the attached PDF file</li>
                <li>Open the PDF with any PDF viewer (Adobe Reader, Chrome, etc.)</li>
                <li>When prompted for password, enter: <strong>${password}</strong></li>
                <li>Your statement will open with all transaction details</li>
              </ol>
            </div>
            
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
            <p style="margin: 0;">NextBank - Secure Banking Solutions</p>
            <p style="margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `NextBank_Statement_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`,
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
      from: process.env.EMAIL_USER || 'NextBank <noreply@nextbank.com>',
      to: userEmail,
      subject: `Transaction Alert - ${type.charAt(0).toUpperCase() + type.slice(1)} of ₹${amount.toLocaleString('en-IN')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF7F11, #FF9F40); padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">NextBank</h1>
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
            <p style="margin: 0;">NextBank - Secure Banking Solutions</p>
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