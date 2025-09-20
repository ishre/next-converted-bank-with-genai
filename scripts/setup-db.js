const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Create a sample user for testing
  const user = await prisma.user.upsert({
    where: { email: 'demo@nextbank.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@nextbank.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4Qz8K2', // password: "demo123"
      accounts: {
        create: {
          balance: 1000.00,
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
