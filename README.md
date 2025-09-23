# SecureDigital - Modern Banking Application

A full-stack banking application built with Next.js 14, PostgreSQL, Prisma, and JWT authentication.

## Features

- 🔐 **Secure Authentication**: JWT-based session management with HttpOnly cookies
- 👤 **User Management**: Registration and login with password validation
- 💰 **Account Management**: Create and manage bank accounts
- 📊 **Transaction Tracking**: View account balance and transaction history
- 💸 **Fund Transfers**: Transfer money between accounts with real-time validation
- 🛡️ **Route Protection**: Middleware-based authentication for protected routes
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- ⚡ **Real-time Updates**: Client-side state management with React hooks

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Styling**: Tailwind CSS

## Database Schema

### User
- `id`: Unique identifier (CUID)
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password
- `createdAt`: Account creation timestamp

### Account
- `id`: Unique identifier (CUID)
- `userId`: Foreign key to User
- `balance`: Account balance (Decimal)
- `createdAt`: Account creation timestamp

### Transaction
- `id`: Unique identifier (CUID)
- `accountId`: Foreign key to Account
- `type`: Transaction type (deposit, withdrawal, transfer)
- `amount`: Transaction amount (Decimal)
- `createdAt`: Transaction timestamp

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (recommend using Neon for cloud hosting)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextbank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/nextbank?schema=public"
   
   # JWT Secret (generate a secure random string in production)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   
   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### User Profile
- `GET /api/user/profile` - Get user profile and account information

### Account Management
- `GET /api/accounts` - Get user's accounts with balance and transactions
- `POST /api/transfers` - Transfer funds between accounts

## Project Structure

```
nextbank/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── register/route.ts
│   │       └── logout/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuthForm.tsx
│   ├── Dashboard.tsx
│   ├── TransferForm.tsx
│   └── TransactionsTable.tsx
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── validation.ts
├── prisma/
│   └── schema.prisma
├── middleware.ts
└── package.json
```

## Security Features

- **Password Hashing**: Uses bcrypt with salt rounds for secure password storage
- **JWT Tokens**: Secure token-based authentication with configurable expiration
- **HttpOnly Cookies**: Prevents XSS attacks by storing tokens in HttpOnly cookies
- **Input Validation**: Comprehensive validation for all user inputs
- **Route Protection**: Middleware-based protection for authenticated routes

## Development

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

### Code Quality

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Deployment

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `DATABASE_URL`: Your production PostgreSQL connection string
- `JWT_SECRET`: A secure, randomly generated secret key
- `NEXTAUTH_URL`: Your production domain URL

### Database Setup

1. Create a PostgreSQL database (recommend Neon for serverless)
2. Set the `DATABASE_URL` environment variable
3. Run migrations: `npx prisma migrate deploy`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.