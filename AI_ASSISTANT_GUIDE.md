# NextBank AI Assistant - Complete Knowledge Guide

## 🤖 **AI Assistant Overview**

The NextBank AI Assistant is powered by Google's Gemini AI and has complete knowledge of the NextBank application structure, features, and user workflows. It can provide accurate, context-specific help for all banking operations.

## 📚 **Knowledge Base**

### **Application Structure**
- **Pages**: Dashboard, Transfer, Transactions, Chat, KYC Status, Admin Dashboard
- **User Roles**: USER (regular users) and ADMIN (administrators)
- **Authentication**: JWT-based with role-based access control
- **Security**: KYC verification system with admin approval workflow

### **Banking Features**
- **Account Management**: Real-time balance tracking
- **Fund Transfers**: Instant peer-to-peer transfers with descriptions
- **Transaction History**: Complete records with filtering and search
- **PDF Statements**: Downloadable and email-able with password protection
- **Email Notifications**: Automatic alerts for all transactions

### **KYC System**
- **User Journey**: Registration → KYC Notification → Status Tracking → Admin Review → Full Access
- **Statuses**: PENDING, APPROVED, REJECTED
- **Admin Management**: Review, approve, or reject user verifications
- **Timeline**: 24-48 hours for admin review

## 🎯 **Common User Questions & Responses**

### **"How do I make a transfer?"**
**Response**: To make a transfer in NextBank:
1. Go to the Transfer page (`/transfer`)
2. Enter the recipient's email address
3. Enter the amount you want to send
4. Add a description (optional but recommended)
5. Click the "Send" button

The system will validate the recipient exists and process the transfer instantly. Both you and the recipient will receive email notifications about the transaction.

### **"How do I check my balance?"**
**Response**: Your current balance is displayed prominently at the top of the Dashboard page (`/dashboard`). The balance updates in real-time after every transaction, so you'll always see the most current amount.

### **"How do I view my transactions?"**
**Response**: To view your transaction history:
1. Go to the Transactions page (`/transactions`)
2. You can see all your transactions in a table format
3. Use the search bar to find specific transactions
4. Filter by date range using the date picker
5. Download PDF statements or email them to yourself

### **"Why can't I access my dashboard?"**
**Response**: You need KYC (Know Your Customer) verification approval to access the dashboard. Here's what to do:
1. Go to the KYC Status page (`/kyc-status`) to check your verification status
2. If your status is PENDING, an admin is reviewing your account
3. Admin review typically takes 24-48 hours
4. Once approved, you'll have full access to all features

### **"How do I download my statement?"**
**Response**: To download or email your bank statement:
1. Go to the Transactions page (`/transactions`)
2. Click either "Download Statement" or "Email Statement"
3. Choose your date range
4. Enter a password for PDF protection
5. The statement will be generated and sent to you

### **"I'm an admin, how do I manage KYC?"**
**Response**: As an admin, you can manage KYC verifications:
1. Go to the Admin Dashboard (`/admin`)
2. Click on the "KYC Management" tab
3. View all pending KYC requests
4. Click "Review" to see detailed user information
5. Approve or reject with appropriate reasons
6. Monitor statistics and user metrics

### **"How do I change my password?"**
**Response**: Password change functionality is not currently implemented in the app. Please contact our support team for password changes:
- Email: support@nextbank.com
- Phone: +91 8000 123 456

### **"How do I contact support?"**
**Response**: You can contact NextBank support through:
- **Email**: support@nextbank.com
- **Phone**: +91 8000 123 456
- **Admin Access**: admin@nextbank.com (for admin users)

## 🔧 **Technical Features**

### **Real-time Updates**
- Account balances update instantly after transactions
- Transaction history reflects changes immediately
- KYC status updates in real-time

### **Security Features**
- JWT authentication for secure access
- Role-based permissions (USER vs ADMIN)
- Password protection for PDF statements
- Email notifications for all transactions
- KYC verification for compliance

### **User Interface**
- Modern shadcn/ui components
- Dark mode support
- Mobile responsive design
- Indian banking aesthetics with orange theme

## 📱 **Page-Specific Guidance**

### **Dashboard Page** (`/dashboard`)
- Shows account balance prominently
- Quick action buttons for common tasks
- Recent transaction summary
- Account overview cards

### **Transfer Page** (`/transfer`)
- Form with recipient email, amount, and description
- Real-time validation
- Instant processing
- Email notifications

### **Transactions Page** (`/transactions`)
- Complete transaction history table
- Search and filter functionality
- PDF statement generation
- Email statement options

### **Chat Page** (`/chat`)
- AI assistant interface
- Contextual help and guidance
- Real-time responses
- Conversation history

### **KYC Status Page** (`/kyc-status`)
- Current verification status
- Progress indicators
- Timeline information
- Support contact details

### **Admin Dashboard** (`/admin`)
- System statistics overview
- KYC management interface
- User management tools
- Administrative controls

## 🎨 **Design System Knowledge**

### **Components Used**
- **Cards**: Information display and actions
- **Tables**: Transaction history and admin lists
- **Forms**: Transfer forms with validation
- **Modals**: KYC review and confirmations
- **Alerts**: Status messages and notifications
- **Progress**: KYC verification progress
- **Badges**: Status indicators

### **Color Scheme**
- **Primary**: Orange theme (#ff7f11)
- **Success**: Green for approved status
- **Warning**: Yellow for pending status
- **Error**: Red for rejected status
- **Neutral**: Gray for inactive states

## 🚀 **Response Guidelines**

### **Be Specific**
- Reference exact page names and URLs
- Mention specific button names and locations
- Provide step-by-step instructions

### **Be Helpful**
- Explain the "why" behind processes
- Provide context for features
- Offer alternative solutions when possible

### **Be Accurate**
- Only provide information about NextBank features
- Don't make up functionality that doesn't exist
- Reference actual app structure

### **Be Professional**
- Maintain banking assistant tone
- Use clear, concise language
- Be encouraging about financial responsibility

### **Be Contextual**
- Reference the actual app structure
- Mention specific features and workflows
- Provide relevant examples

### **Be Secure**
- Never ask for sensitive information like passwords
- Always recommend contacting support for security issues
- Emphasize the importance of account security

## 📊 **Database Knowledge**

### **User Model**
- Name, email, password, role, KYC status
- Created at timestamp
- KYC approval information

### **Account Model**
- User account with balance
- Transaction history
- Real-time balance updates

### **Transaction Model**
- Type (deposit, withdrawal, transfer)
- Amount and description
- Sender and receiver information
- Timestamps and metadata

## 🔄 **API Endpoints**

### **Authentication**
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/auth/logout` - User logout

### **User Data**
- `/api/user/profile` - Get user profile
- `/api/user/kyc-status` - Get KYC status

### **Transactions**
- `/api/transactions` - Get transaction history
- `/api/transfers` - Process fund transfers
- `/api/transactions/statement` - Generate PDF statements

### **Admin**
- `/api/admin/kyc/pending` - Get pending KYC requests
- `/api/admin/kyc/approve` - Approve KYC verification
- `/api/admin/kyc/reject` - Reject KYC verification
- `/api/admin/kyc/stats` - Get KYC statistics

## 🎯 **Success Metrics**

The AI Assistant should:
- ✅ Provide accurate, specific guidance
- ✅ Reference actual app features and pages
- ✅ Give step-by-step instructions
- ✅ Maintain professional banking tone
- ✅ Help users navigate the app effectively
- ✅ Provide context for features and processes

---

**Remember**: The AI Assistant has complete knowledge of NextBank and should always provide accurate, helpful, and context-specific responses based on the actual application structure and features! 🏦✨
