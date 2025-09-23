const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  const hashed = await bcrypt.hash('demo123', 12)
  
  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'askshreyash@gmail.com' },
    update: { password: hashed, role: 'ADMIN' },
    create: {
      name: 'Admin Shreyash',
      email: 'askshreyash@gmail.com',
      role: 'ADMIN',
      password: hashed, // demo123
      accounts: {
        create: {
          balance: 5000000.00,
          accountNumber: '410000000100'
        }
      }
    },
    include: { accounts: true }
  })

  // Create standard user
  const userStd = await prisma.user.upsert({
    where: { email: 'shreyashd365@gmail.com' },
    update: { password: hashed },
    create: {
      name: 'Shreyash',
      email: 'shreyashd365@gmail.com',
      password: hashed, // demo123
      accounts: {
        create: {
          balance: 10000.00,
          accountNumber: '410000000101'
        }
      }
    },
    include: { accounts: true }
  })

  // Create a sample user for testing
  const user = await prisma.user.upsert({
    where: { email: 'demo@nextbank.com' },
    update: { password: hashed },
    create: {
      name: 'Demo User',
      email: 'demo@nextbank.com',
      password: hashed, // password: "demo123"
      accounts: {
        create: {
          balance: 1000.00,
          accountNumber: '410000000001',
          transactions: {
            create: [
              {
                type: 'deposit',
                amount: 1000.00
              },
              {
                type: 'deposit',
                amount: 500.00
              },
              {
                type: 'withdrawal',
                amount: -200.00
              }
            ]
          }
        }
      }
    },
    include: {
      accounts: {
        include: {
          transactions: true
        }
      }
    }
  })

  console.log('✅ Demo user created:', {
    email: user.email,
    name: user.name,
    accountBalance: user.accounts[0].balance,
    transactionCount: user.accounts[0].transactions.length
  })
  console.log('✅ Admin created:', { email: admin.email, balance: admin.accounts[0].balance })
  console.log('✅ Standard user created:', { email: userStd.email, balance: userStd.accounts[0].balance })
  
  console.log('🎉 Database seeded successfully!')
  console.log('📧 Demo credentials: demo@nextbank.com / demo123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
