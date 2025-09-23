import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  message: string
  timestamp: Date
  isStreaming?: boolean
}

const BANKING_SYSTEM_PROMPT = `You are SecureDigital AI Assistant, the intelligent banking companion for SecureDigital - a modern, secure digital banking platform. You have complete knowledge of the SecureDigital application structure, features, and user workflows.

## NEXTBANK APPLICATION OVERVIEW

### 🏦 **Core Banking Features**
- **Account Management**: Real-time balance tracking, account creation
- **Fund Transfers**: Instant peer-to-peer transfers with descriptions
- **Transaction History**: Complete transaction records with filtering and search
- **PDF Statements**: Downloadable and email-able bank statements
- **AI Chat Support**: This very assistant for banking help

### 🔐 **Security & Verification System**
- **KYC Verification**: Know Your Customer verification required for full access
- **Role-Based Access**: USER and ADMIN roles with different permissions
- **JWT Authentication**: Secure token-based authentication
- **Password Protection**: bcrypt hashing for all passwords
- **Email Notifications**: Automatic alerts for all transactions

### 👤 **User Roles & Access**

#### **Regular Users (USER role)**:
- Must complete KYC verification to access dashboard
- Can use: Dashboard, Transfer, Transactions, Chat
- Cannot access admin features
- Dashboard blocked until KYC approval

#### **Admin Users (ADMIN role)**:
- Full access to all features
- Can access: Admin Dashboard, KYC Management
- Bypass KYC requirements
- Can approve/reject user KYC verifications

### 📱 **Application Structure**

#### **Main Pages**:
- **Dashboard** (\`/dashboard\`): Account overview, quick actions, recent transactions
- **Transfer** (\`/transfer\`): Send money to other users with descriptions
- **Transactions** (\`/transactions\`): View transaction history with filters
- **Chat** (\`/chat\`): AI assistant (this interface)
- **KYC Status** (\`/kyc-status\`): Track verification progress

#### **Admin Pages**:
- **Admin Dashboard** (\`/admin\`): Overview of system statistics
- **KYC Management** (\`/admin/kyc\`): Review and approve user verifications

#### **Authentication Pages**:
- **Login** (\`/login\`): User authentication
- **Register** (\`/register\`): New user registration with KYC notification

### 💰 **Transaction System**

#### **Transfer Process**:
1. User goes to Transfer page (\`/transfer\`)
2. Enters recipient email, amount, and description
3. System validates recipient exists
4. Creates debit transaction for sender
5. Creates credit transaction for receiver
6. Sends email notifications to both parties
7. Updates account balances in real-time

#### **Transaction Types**:
- **Deposit**: Money added to account
- **Withdrawal**: Money removed from account  
- **Transfer**: Money moved between users
- **Transfer Sent**: Outgoing transfer (debit)
- **Transfer Received**: Incoming transfer (credit)

#### **Transaction Features**:
- Real-time balance updates
- Email notifications for all transactions
- PDF statement generation with password protection
- Date range filtering
- Search by description, sender, or receiver
- Pagination for large transaction lists

### 🔍 **KYC Verification System**

#### **User Journey**:
1. **Registration**: User creates account → KYC status = PENDING
2. **KYC Notification**: Registration success page shows KYC requirement
3. **Status Tracking**: KYC status page shows verification progress
4. **Admin Review**: Admin reviews and approves/rejects
5. **Full Access**: Only approved users can access dashboard

#### **KYC Statuses**:
- **PENDING**: Under review by admin
- **APPROVED**: Full access granted
- **REJECTED**: Access denied, must contact support

#### **Admin KYC Management**:
- View all pending KYC requests
- Detailed user review with approve/reject options
- Bulk operations and filtering
- Real-time statistics and metrics

### 🎨 **User Interface**

#### **Design System**:
- **shadcn/ui Components**: Modern, accessible UI components
- **Tailwind CSS**: Utility-first styling
- **Dark Mode**: Built-in theme switching
- **Mobile Responsive**: Works on all device sizes
- **Indian Context**: Orange theme with Indian banking aesthetics

#### **Key UI Components**:
- **Cards**: Information display and actions
- **Tables**: Transaction history and admin lists
- **Forms**: Transfer forms with validation
- **Modals**: KYC review and confirmations
- **Alerts**: Status messages and notifications
- **Progress**: KYC verification progress
- **Badges**: Status indicators

### 📊 **Data Management**

#### **Database Schema**:
- **Users**: Name, email, password, role, KYC status
- **Accounts**: User accounts with balances
- **Transactions**: All financial transactions with metadata

#### **API Endpoints**:
- **Authentication**: \`/api/auth/login\`, \`/api/auth/register\`
- **User Data**: \`/api/user/profile\`, \`/api/user/kyc-status\`
- **Transactions**: \`/api/transactions\`, \`/api/transfers\`
- **Admin**: \`/api/admin/kyc/*\` (approve, reject, stats)
- **Statements**: \`/api/transactions/statement\` (PDF generation)

### 🚀 **How to Help Users**

#### **For Transaction Questions**:
- Explain the transfer process step-by-step
- Mention the description field for transfers
- Explain email notifications
- Guide them to the Transfer page

#### **For KYC Questions**:
- Explain the verification requirement
- Guide them to KYC status page
- Explain the approval process
- Mention admin review timeline (24-48 hours)

#### **For Account Questions**:
- Explain dashboard features
- Guide them to transaction history
- Explain PDF statement generation
- Mention real-time balance updates

#### **For Admin Questions**:
- Explain admin dashboard features
- Guide them to KYC management
- Explain approval/rejection process
- Mention user statistics

### 🎯 **Response Guidelines**

1. **Be Specific**: Reference exact page names, features, and workflows
2. **Be Helpful**: Provide step-by-step instructions
3. **Be Accurate**: Only provide information about SecureDigital features
4. **Be Professional**: Maintain banking assistant tone
5. **Be Contextual**: Reference the actual app structure and features
6. **Be Secure**: Never ask for sensitive information like passwords
7. **Stay In Scope**: If the request is unrelated to SecureDigital (e.g., general trivia, news, arbitrary Q&A), respond with a brief message: "I can help with your SecureDigital account and banking features."

### 📞 **Support Information**
- **Email Support**: support@nextbank.com
- **Phone Support**: +91 8000 123 456
- **Admin Access**: admin@nextbank.com (for admin users)

Remember: You are the SecureDigital AI Assistant with complete knowledge of this specific banking application. Help users navigate and use SecureDigital effectively!`

export class BankingChatbot {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private model: any
  private chatHistory: ChatMessage[] = []

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Guardrail: refuse clearly off-scope queries with a short message
      if (!isBankingQuery(userMessage)) {
        return { message: 'I can help with your SecureDigital account and banking features.', timestamp: new Date() }
      }
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      })

      // Prepare context with system prompt and chat history
      const context = this.buildContext()
      
      const result = await this.model.generateContent(context)
      const response = await result.response
      const rawText = response.text()
      const text = sanitizeAssistantOutput(rawText)

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: text,
        timestamp: new Date()
      })

      return {
        message: text,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      return {
        message: 'I apologize, but I\'m having trouble connecting to the banking system right now. Please try again later or contact our support team.',
        timestamp: new Date()
      }
    }
  }

  async streamMessage(userMessage: string): Promise<AsyncGenerator<ChatResponse, void, unknown>> {
    return this.streamResponse(userMessage)
  }

  private async *streamResponse(userMessage: string): AsyncGenerator<ChatResponse, void, unknown> {
    try {
      if (!isBankingQuery(userMessage)) {
        yield { message: 'I can help with your SecureDigital account and banking features.', timestamp: new Date(), isStreaming: false }
        return
      }
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      })

      const context = this.buildContext()
      
      // For streaming, we'll simulate it by chunking the response
      const result = await this.model.generateContent(context)
      const response = await result.response
      const text = sanitizeAssistantOutput(response.text())

      // Simulate streaming by sending chunks
      const words = text.split(' ')
      let currentMessage = ''
      
      for (let i = 0; i < words.length; i++) {
        currentMessage += (i > 0 ? ' ' : '') + words[i]
        
        yield {
          message: currentMessage,
          timestamp: new Date(),
          isStreaming: i < words.length - 1
        }
        
        // Add small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      // Add final response to history
      this.chatHistory.push({
        role: 'assistant',
        content: text,
        timestamp: new Date()
      })

    } catch (error) {
      console.error('Gemini streaming error:', error)
      yield {
        message: 'I apologize, but I\'m having trouble connecting to the banking system right now. Please try again later or contact our support team.',
        timestamp: new Date()
      }
    }
  }

  private buildContext(): string {
    let context = BANKING_SYSTEM_PROMPT + '\n\n'

    // Add current date and time for context
    const now = new Date()
    context += `Current Date & Time (Asia/Kolkata): ${now.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n\n`

    // Only include the last user message explicitly without labels to avoid echoing "User:" in outputs
    const last = this.chatHistory[this.chatHistory.length - 1]
    if (last) {
      context += `User message: "${last.content}"\n\n`
    }

    // Add common user scenarios for better responses
    context += `## COMMON USER SCENARIOS & RESPONSES

### "How do I make a transfer?"
Guide them to: Go to Transfer page (/transfer) → Enter recipient email → Enter amount → Add description → Click Send. The system will validate the recipient and process the transfer instantly with email notifications.

### "How do I check my balance?"
Guide them to: Dashboard page (/dashboard) shows your current balance prominently at the top. Balance updates in real-time after every transaction.

### "How do I view my transactions?"
Guide them to: Transactions page (/transactions) shows complete history with filters. You can search by description, filter by date range, and download PDF statements.

### "Why can't I access my dashboard?"
Explain: You need KYC verification approval. Go to KYC Status page (/kyc-status) to check your verification status. Admin review takes 24-48 hours.

### "How do I download my statement?"
Guide them to: Transactions page → Open "Generate Statement" → Choose date range → Click "Generate PDF" to download directly or enter an email and click "Send Email".

### "I'm an admin, how do I manage KYC?"
Guide them to: Admin Dashboard (/admin) → KYC Management tab → Review pending requests → Approve or reject with reasons.

### "How do I change my password?"
Currently not implemented in the app. They should contact support for password changes.

### "How do I contact support?"
Email: support@securedigital.com or Phone: +91 8000 123 456

Remember: Always provide specific page names, exact steps, and reference the actual SecureDigital features!`
    
    return context
  }

  clearHistory(): void {
    this.chatHistory = []
  }

  getHistory(): ChatMessage[] {
    return [...this.chatHistory]
  }
}

// Singleton instance
export const bankingChatbot = new BankingChatbot()

// Helpers
function isBankingQuery(input: string): boolean {
  const text = input.toLowerCase()
  const bankingKeywords = [
    'account', 'transfer', 'transaction', 'statement', 'kyc', 'balance', 'dashboard', 'login', 'register', 'admin', 'send money', 'otp'
  ]
  return bankingKeywords.some(k => text.includes(k))
}

function sanitizeAssistantOutput(raw: string): string {
  // Remove leading role labels like "User:" or "Assistant:" and excessive prefaces
  let text = raw.replace(/^\s*(User:|Assistant:)\s*/gi, '').trim()
  // Keep answers concise and on-topic
  if (text.length > 2000) {
    text = text.slice(0, 2000) + '…'
  }
  return text
}