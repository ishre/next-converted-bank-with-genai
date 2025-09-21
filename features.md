# NextBank - Complete Project Structure & Feature Overview

## 🏗️ **Project Architecture**

NextBank is a modern, full-stack banking application built with Next.js 14, featuring a comprehensive set of banking functionalities with AI-powered chat assistance.

## 📁 **Complete Directory Structure**

```
nextbank/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # API Routes (Backend)
│   │   ├── 📁 accounts/             # Account management
│   │   │   └── route.ts            # GET user accounts with balance & transactions
│   │   ├── 📁 auth/                 # Authentication endpoints
│   │   │   ├── 📁 login/           # User login
│   │   │   │   └── route.ts        # POST login with JWT & rate limiting
│   │   │   ├── 📁 logout/          # User logout
│   │   │   │   └── route.ts        # POST logout (clear cookies)
│   │   │   └── 📁 register/        # User registration
│   │   │       └── route.ts        # POST register with validation
│   │   ├── 📁 chat/                 # AI Chat functionality
│   │   │   └── route.ts            # POST chat with Gemini AI
│   │   ├── 📁 notifications/        # Notification system
│   │   │   └── 📁 check/           # Manual notification checks
│   │   │       └── route.ts        # GET check low balance alerts
│   │   ├── 📁 transfers/            # Money transfer system
│   │   │   └── route.ts            # POST transfer funds between users
│   │   └── 📁 user/                 # User profile management
│   │       └── 📁 profile/          # User profile data
│   │           └── route.ts        # GET user profile & account info
│   ├── 📁 chat/                     # Chat interface page
│   │   └── page.tsx                # AI-powered banking assistant
│   ├── 📁 dashboard/                # Main dashboard
│   │   └── page.tsx                # User dashboard with accounts & transfers
│   ├── 📁 login/                    # Login page
│   │   └── page.tsx                # User authentication
│   ├── 📁 register/                 # Registration page
│   │   └── page.tsx                # New user registration
│   ├── 📁 transactions/             # Transaction history
│   │   └── page.tsx                # Transaction listing page
│   ├── 📁 transfer/                 # Transfer funds page
│   │   └── page.tsx                # Money transfer interface
│   ├── globals.css                  # Global styles (Tailwind)
│   ├── layout.tsx                  # Root layout with fonts & wrapper
│   └── page.tsx                    # Landing page
├── 📁 components/                   # React Components
│   ├── AuthForm.tsx                # Login/Register form component
│   ├── ChatInterface.tsx           # AI chat interface with Gemini
│   ├── Dashboard.tsx               # Main dashboard component
│   ├── LayoutWrapper.tsx           # Layout wrapper with navigation
│   ├── Navigation.tsx              # Top navigation bar
│   ├── TransactionsTable.tsx       # Transaction history table
│   └── TransferForm.tsx            # Money transfer form
├── 📁 lib/                         # Utility Libraries
│   ├── auth.ts                     # JWT authentication utilities
│   ├── csrf.ts                     # CSRF protection
│   ├── email.ts                    # Email service (Nodemailer)
│   ├── error-handler.ts            # Centralized error handling
│   ├── gemini.ts                   # Google Gemini AI integration
│   ├── notifications.ts            # Notification service
│   ├── prisma.ts                   # Database connection
│   ├── rate-limiter.ts             # API rate limiting
│   ├── validation-schemas.ts       # Zod validation schemas
│   └── validation.ts               # Input validation utilities
├── 📁 prisma/                      # Database Schema & Migrations
│   ├── 📁 migrations/              # Database migrations
│   │   └── 20250920004345_init/   # Initial database setup
│   │       └── migration.sql       # User, Account, Transaction tables
│   └── schema.prisma               # Prisma database schema
├── 📁 __tests__/                   # Test Suite
│   ├── 📁 api/                     # API endpoint tests
│   │   ├── 📁 auth/
│   │   │   └── login.test.ts       # Login API tests
│   │   └── transfers.test.ts       # Transfer API tests
│   └── 📁 components/              # Component tests
│       ├── AuthForm.test.tsx       # Auth form tests
│       └── TransferForm.test.tsx   # Transfer form tests
├── 📁 scripts/                     # Database scripts
│   └── setup-db.js                 # Database seeding script
├── 📁 public/                      # Static assets
│   └── *.svg                       # Next.js default icons
├── middleware.ts                   # Next.js middleware for auth
├── package.json                    # Dependencies & scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Jest testing configuration
├── eslint.config.mjs               # ESLint configuration
└── README.md                       # Project documentation
```

## 🚀 **Core Features & Functionality**

### 1. **Authentication System** 🔐

**Purpose**: Secure user authentication and session management

**Key Features**:
- JWT-based authentication with HttpOnly cookies
- Password hashing using bcrypt with 12 salt rounds
- Rate limiting on login attempts (5 attempts per 15 minutes)
- CSRF protection for secure form submissions
- Session management with 7-day token expiration

**Files**:
- `lib/auth.ts` - JWT utilities, password hashing
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/register/route.ts` - Registration endpoint
- `app/api/auth/logout/route.ts` - Logout endpoint
- `components/AuthForm.tsx` - Login/Register UI

**Authentication Flow**:
1. User submits login/register form
2. Server validates input with Zod schemas
3. Password is hashed/verified with bcrypt
4. JWT token is generated and stored in HttpOnly cookie
5. User is redirected to dashboard
6. Middleware validates token on protected routes

### 2. **User Management** 👤

**Purpose**: Handle user accounts, profiles, and account creation

**Key Features**:
- User registration with comprehensive validation
- Profile management with account information
- Account creation automatically on registration
- User data persistence in PostgreSQL

**Validation Rules**:
- Name: 2-50 characters, letters and spaces only
- Email: Valid email format, unique constraint
- Password: 8+ characters, uppercase, lowercase, number, special character

**Files**:
- `app/api/auth/register/route.ts` - Registration logic
- `app/api/user/profile/route.ts` - Profile management
- `lib/validation-schemas.ts` - Input validation

### 3. **Account Management** 💰

**Purpose**: Manage user bank accounts and balances

**Key Features**:
- Multiple account support per user
- Real-time balance tracking with decimal precision
- Account history with transaction records
- Balance calculations across all accounts

**Account Features**:
- Automatic account creation on user registration
- Decimal precision for accurate financial calculations
- Transaction history linked to accounts
- Real-time balance updates

**Files**:
- `app/api/accounts/route.ts` - Account data retrieval
- `app/api/user/profile/route.ts` - User profile management
- `prisma/schema.prisma` - Database schema

### 4. **Money Transfer System** 💸

**Purpose**: Enable peer-to-peer money transfers between users

**Key Features**:
- Peer-to-peer transfers via email addresses
- Real-time balance updates with database transactions
- Transfer validation (minimum $0.01, maximum $100,000)
- Transaction history with debit/credit records
- Email notifications for both sender and recipient

**Transfer Process**:
1. Validate recipient exists in database
2. Check sender has sufficient balance
3. Update both accounts atomically using database transaction
4. Create transaction records for audit trail
5. Send email notifications to both parties

**Transfer Limits**:
- Minimum: $0.01
- Maximum: $100,000
- No transfer fees
- Instant processing

**Files**:
- `app/api/transfers/route.ts` - Transfer processing
- `components/TransferForm.tsx` - Transfer UI
- `components/TransactionsTable.tsx` - Transaction display

### 5. **AI-Powered Chat Assistant** 🤖

**Purpose**: Provide intelligent banking assistance using Google Gemini AI

**Key Features**:
- Google Gemini AI integration for banking assistance
- Contextual responses about banking policies
- Streaming responses for real-time interaction
- Rate limiting to prevent abuse
- Banking-specific prompts and guidelines

**AI Capabilities**:
- Account balance inquiries
- Transfer limits and policies explanation
- Security questions and concerns
- General banking FAQs
- Transaction history help
- Account management guidance

**Chat Features**:
- Real-time streaming responses
- Chat history maintenance
- Quick action buttons for common questions
- Error handling and fallback responses

**Files**:
- `lib/gemini.ts` - AI chatbot implementation
- `app/api/chat/route.ts` - Chat API endpoint
- `components/ChatInterface.tsx` - Chat UI
- `app/chat/page.tsx` - Chat page

### 6. **Notification System** 📧

**Purpose**: Send automated notifications for various banking events

**Key Features**:
- Email notifications using Nodemailer
- Low balance alerts (below $100)
- Transfer notifications for sent/received funds
- Welcome emails for new users
- Scheduled notification checks

**Notification Types**:
- **Welcome Email**: Sent to new users after registration
- **Transfer Sent**: Confirmation when user sends money
- **Transfer Received**: Notification when user receives money
- **Low Balance Alert**: Warning when balance drops below $100

**Files**:
- `lib/notifications.ts` - Notification service
- `lib/email.ts` - Email service
- `app/api/notifications/check/route.ts` - Manual checks

### 7. **Security Features** 🛡️

**Purpose**: Protect user data and prevent unauthorized access

**Security Measures**:
- JWT token authentication with secure headers
- HttpOnly cookies to prevent XSS attacks
- CSRF token validation for form submissions
- Rate limiting on sensitive endpoints
- Input validation with Zod schemas
- Password strength requirements
- SQL injection prevention via Prisma ORM

**Rate Limiting**:
- Login attempts: 5 per 15 minutes
- General API: 100 per 15 minutes
- Chat API: 50 per 15 minutes

**Files**:
- `middleware.ts` - Route protection
- `lib/csrf.ts` - CSRF protection
- `lib/rate-limiter.ts` - Rate limiting
- `lib/validation-schemas.ts` - Input validation

### 8. **Database Schema** 🗄️

**Purpose**: Store and manage all application data

**User Table**:
```sql
- id (CUID) - Primary key
- name (String) - User's full name
- email (String, Unique) - Email address
- password (String) - Hashed password
- createdAt (DateTime) - Account creation timestamp
```

**Account Table**:
```sql
- id (CUID) - Primary key
- userId (String) - Foreign key to User
- balance (Decimal) - Account balance (10,2 precision)
- createdAt (DateTime) - Account creation timestamp
```

**Transaction Table**:
```sql
- id (CUID) - Primary key
- accountId (String) - Foreign key to Account
- type (String) - Transaction type (deposit, withdrawal, transfer_in, transfer_out)
- amount (Decimal) - Transaction amount
- createdAt (DateTime) - Transaction timestamp
```

**Database Features**:
- CUID primary keys for better performance
- Decimal precision for accurate financial calculations
- Foreign key relationships with cascade deletes
- Indexed fields for optimal query performance

### 9. **User Interface** 🎨

**Purpose**: Provide intuitive and responsive user experience

**UI Features**:
- Responsive design with Tailwind CSS
- Modern UI components with consistent styling
- Loading states and error handling
- Mobile-friendly navigation
- Real-time updates without page refresh

**Pages**:
- **Dashboard** - Account overview, balance, recent transactions
- **Transfer** - Money transfer interface
- **Transactions** - Complete transaction history
- **Chat** - AI assistant interface
- **Login/Register** - Authentication pages

**Design System**:
- Color scheme: Indigo primary, gray secondary
- Typography: Geist Sans and Geist Mono fonts
- Components: Consistent button styles, form inputs, cards
- Responsive breakpoints: Mobile-first design

### 10. **Testing Suite** 🧪

**Purpose**: Ensure code quality and prevent regressions

**Test Coverage**:
- Jest configuration for unit testing
- API endpoint tests for critical functionality
- Component tests for UI components
- Test coverage reporting

**Test Files**:
- `jest.config.js` - Jest configuration
- `__tests__/api/auth/login.test.ts` - Login API tests
- `__tests__/api/transfers.test.ts` - Transfer API tests
- `__tests__/components/AuthForm.test.tsx` - Auth form tests
- `__tests__/components/TransferForm.test.tsx` - Transfer form tests

## 🔧 **Technical Stack**

### Frontend:
- **Next.js 14** (App Router) - React framework
- **React 19** with TypeScript - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Client-side state management** - React hooks

### Backend:
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database operations
- **PostgreSQL** - Primary database
- **JWT authentication** - Session management

### AI & External Services:
- **Google Gemini AI** - Chat functionality
- **Nodemailer** - Email services

### Development Tools:
- **TypeScript** - Type safety
- **ESLint** - Code quality
- **Jest** - Testing framework
- **Prisma Studio** - Database management

## 🌐 **Key API Endpoints**

### Authentication:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User & Accounts:
- `GET /api/user/profile` - Get user profile
- `GET /api/accounts` - Get user accounts with transactions

### Transfers:
- `POST /api/transfers` - Transfer money between users

### Chat:
- `POST /api/chat` - AI chat assistance

### Notifications:
- `GET /api/notifications/check` - Check low balance alerts

## 🔒 **Security Implementation**

### Authentication Security:
1. **JWT Tokens**: Secure token-based authentication
2. **HttpOnly Cookies**: Prevent XSS attacks
3. **Password Hashing**: bcrypt with salt rounds
4. **Session Management**: 7-day token expiration

### Authorization Security:
1. **Middleware Protection**: Route-based access control
2. **Token Validation**: Verify JWT on each request
3. **User Context**: Pass user info via headers

### Input Security:
1. **Zod Validation**: Schema-based input validation
2. **SQL Injection Prevention**: Prisma ORM parameterized queries
3. **XSS Prevention**: Input sanitization and HttpOnly cookies

### Rate Limiting:
1. **Login Protection**: 5 attempts per 15 minutes
2. **API Protection**: 100 requests per 15 minutes
3. **Chat Protection**: 50 requests per 15 minutes

## 📊 **Business Logic**

### Transfer System:
- **Minimum Transfer**: $0.01
- **Maximum Transfer**: $100,000
- **No Fees**: Free transfers between users
- **Instant Processing**: Real-time balance updates
- **Email Notifications**: Both parties notified

### Account Management:
- **Automatic Creation**: Account created on registration
- **Multiple Accounts**: Support for multiple accounts per user
- **Real-time Updates**: Balance updates immediately
- **Transaction History**: Complete audit trail

### Notification System:
- **Low Balance Alerts**: Triggered below $100
- **Transfer Confirmations**: All transactions notified
- **Welcome Emails**: New user onboarding

## 🚀 **Getting Started**

### Prerequisites:
- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Installation:
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Start development server: `npm run dev`

### Environment Variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nextbank"
JWT_SECRET="your-super-secret-jwt-key"
GEMINI_API_KEY="your-gemini-api-key"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

## 📈 **Performance Features**

### Database Optimization:
- **Prisma ORM**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Indexed Fields**: Fast query performance

### Frontend Optimization:
- **Next.js App Router**: Server-side rendering
- **Client-side State**: React hooks for state management
- **Lazy Loading**: Component-based code splitting

### API Optimization:
- **Rate Limiting**: Prevent abuse and overload
- **Error Handling**: Graceful error responses
- **Validation**: Early input validation

## 🔮 **Future Enhancements**

### Planned Features:
- **Mobile App**: React Native implementation
- **Advanced Analytics**: Transaction insights and reports
- **Bill Payments**: Utility and service payments
- **Investment Tracking**: Portfolio management
- **Multi-currency Support**: International transfers
- **Biometric Authentication**: Fingerprint/Face ID
- **Real-time Notifications**: WebSocket implementation
- **Advanced Security**: 2FA and device management

### Technical Improvements:
- **Microservices**: Service-oriented architecture
- **Caching**: Redis for improved performance
- **Monitoring**: Application performance monitoring
- **CI/CD**: Automated deployment pipeline
- **Load Balancing**: Horizontal scaling support

---

This comprehensive banking application provides a complete solution for digital banking with modern security practices, AI assistance, and a user-friendly interface. The modular architecture allows for easy maintenance and future enhancements while maintaining high security standards and excellent user experience.
