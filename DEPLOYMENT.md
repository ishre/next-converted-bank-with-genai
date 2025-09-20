# NextBank Deployment Guide

This guide will help you deploy NextBank to Vercel with a Neon PostgreSQL database.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
3. **Google Cloud Account**: For Gemini API access
4. **Gmail Account**: For email notifications

## Step 1: Set up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a new project
2. Copy the connection string (it will look like):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this for later use

## Step 2: Set up Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Save this for later use

## Step 3: Set up Gmail SMTP

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Save this password for later use

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see Step 5)

## Step 5: Configure Environment Variables

In your Vercel dashboard, go to Project Settings → Environment Variables and add:

```bash
# Database
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth URL (your Vercel domain)
NEXTAUTH_URL=https://your-project.vercel.app

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Production Environment
NODE_ENV=production
```

## Step 6: Run Database Migrations

After deployment, you need to run the database migrations:

1. Go to your Vercel project dashboard
2. Go to Functions → Edge Functions
3. Create a new Edge Function to run migrations:

```javascript
// api/migrate.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // This will run the migrations
    await prisma.$executeRaw`SELECT 1`
    res.status(200).json({ message: 'Database connected successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    await prisma.$disconnect()
  }
}
```

Or run migrations locally with the production database:

```bash
# Set the production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

## Step 7: Seed the Database (Optional)

To add demo data:

```bash
# Set the production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run the seed script
npm run db:seed
```

## Step 8: Verify Deployment

1. Visit your Vercel URL
2. Test the following features:
   - [ ] User registration
   - [ ] User login
   - [ ] Dashboard access
   - [ ] Account balance display
   - [ ] Fund transfers
   - [ ] Transaction history
   - [ ] Chat with AI assistant
   - [ ] Email notifications (check your email)

## Step 9: Set up Monitoring (Optional)

1. **Vercel Analytics**: Enable in your Vercel dashboard
2. **Error Tracking**: Consider adding Sentry or similar
3. **Database Monitoring**: Use Neon's built-in monitoring

## Environment-Specific Notes

### Development
- Use `http://localhost:3000` for NEXTAUTH_URL
- Use local PostgreSQL or Neon development database
- Set NODE_ENV=development

### Production
- Use your Vercel domain for NEXTAUTH_URL
- Use Neon production database
- Set NODE_ENV=production
- Use strong, unique JWT_SECRET
- Use production email credentials

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Ensure SSL is enabled (sslmode=require)
   - Verify database credentials

2. **JWT Token Errors**
   - Ensure JWT_SECRET is set
   - Check token expiration settings

3. **Email Not Sending**
   - Verify SMTP credentials
   - Check Gmail app password
   - Ensure 2FA is enabled

4. **Gemini API Errors**
   - Verify API key is correct
   - Check API quotas and limits

### Debug Commands

```bash
# Check environment variables
vercel env ls

# View function logs
vercel logs

# Test database connection
vercel env pull .env.local
npm run db:studio
```

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Database credentials secured
- [ ] API keys not exposed in client code
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints

## Performance Optimization

- [ ] Enable Vercel Edge Functions
- [ ] Use Vercel's CDN
- [ ] Optimize images
- [ ] Enable compression
- [ ] Monitor Core Web Vitals

## Backup Strategy

1. **Database Backups**: Neon provides automatic backups
2. **Code Backups**: Use Git version control
3. **Environment Variables**: Store securely (Vercel handles this)

## Support

If you encounter issues:

1. Check Vercel function logs
2. Check Neon database logs
3. Review this deployment guide
4. Check the main README.md for setup instructions

---

**Note**: This deployment guide assumes you're using the default configuration. Adjust settings based on your specific requirements.
