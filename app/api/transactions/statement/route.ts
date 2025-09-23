import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendStatementEmail } from '@/lib/email'
import { generatePDFStatement } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { startDate, endDate, email } = body

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get transactions for the date range
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId: userId
        },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        sender: {
          select: { name: true, email: true }
        },
        receiver: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Generate PDF statement
    const pdfBuffer = await generatePDFStatement({
      user: user,
      transactions: transactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        senderName: t.senderName || t.sender?.name,
        receiverName: t.receiverName || t.receiver?.name,
        createdAt: t.createdAt
      })),
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    })

    // Send email with PDF attachment
    const emailResult = await sendStatementEmail({
      to: email || user.email,
      userName: user.name,
      pdfBuffer,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    })

    // Return the PDF directly when no email provided
    if (!email) {
      const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength)
      return new NextResponse(arrayBuffer as ArrayBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="SecureDigital_Statement_${new Date(startDate).toISOString().split('T')[0]}_to_${new Date(endDate).toISOString().split('T')[0]}.pdf"`
        }
      })
    }

    if (emailResult.success) {
      return NextResponse.json({ message: 'Statement generated', emailSent: true })
    }

    return NextResponse.json({ message: 'PDF generated but email failed to send', emailSent: false, error: emailResult.error }, { status: 500 })

  } catch (error) {
    console.error('Statement generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
