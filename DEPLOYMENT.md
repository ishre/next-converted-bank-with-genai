# NextBank Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository with the code
- Database (PostgreSQL) - Neon, Supabase, or similar
- Email service (Gmail, SendGrid, etc.)

### Environment Variables

Set these environment variables in your Vercel dashboard:

#### Required Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google AI (for chat feature)
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

#### Optional Variables
```bash
# Next.js
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Deployment Steps

1. **Connect Repository**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables listed above

3. **Deploy**
   - Vercel will automatically build and deploy
   - The build should now succeed with the fixed dependencies

### Database Setup

1. **Create Database**
   - Use Neon, Supabase, or any PostgreSQL provider
   - Get the connection string

2. **Run Migrations**
   ```bash
   npx prisma db push
   ```

3. **Create Admin User**
   - Use the admin credentials:
   - Email: `admin@nextbank.com`
   - Password: `admin123`

### Post-Deployment

1. **Test Admin Access**
   - Login with admin credentials
   - Verify admin dashboard is accessible
   - Test KYC management features

2. **Test User Flow**
   - Register a new user
   - Verify KYC status page works
   - Test that dashboard is blocked until KYC approval

3. **Configure Email**
   - Set up email service
   - Test email notifications
   - Verify PDF generation works

### Troubleshooting

#### Build Issues
- Ensure `autoprefixer` and `postcss` are in dependencies (not devDependencies)
- Check that all required environment variables are set
- Verify database connection string is correct

#### Runtime Issues
- Check Vercel function logs for API errors
- Verify database permissions
- Test email configuration

#### Security
- Use strong JWT secrets
- Enable HTTPS (automatic with Vercel)
- Regularly update dependencies

### Features Included

✅ **User Authentication**
- Login/Register with JWT
- Password hashing with bcrypt

✅ **KYC Verification System**
- Role-based access control
- Admin approval workflow
- Email notifications

✅ **Banking Features**
- Account management
- Fund transfers
- Transaction history
- PDF statements

✅ **Admin Dashboard**
- KYC management
- User statistics
- Approval/rejection workflow

✅ **Security**
- Middleware protection
- Role-based permissions
- Input validation

### Support

For deployment issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test database connectivity
4. Review function logs

The application is now ready for production deployment! 🚀