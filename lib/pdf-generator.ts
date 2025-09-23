import jsPDF from 'jspdf'

interface Transaction {
  id: string
  type: string
  amount: number
  description?: string
  senderName?: string
  receiverName?: string
  createdAt: Date
}

interface StatementData {
  user: {
    name: string
    email: string
  }
  transactions: Transaction[]
  startDate: Date
  endDate: Date
}

export async function generatePDFStatement(data: StatementData): Promise<Buffer> {
  const { user, transactions, startDate, endDate } = data
  
  // Create new PDF document
  const doc = new jsPDF()
  
  // Note: Password protection would require additional library setup
  // For now, we'll generate unprotected PDFs

  // Add header
  doc.setFontSize(20)
  doc.setTextColor(255, 127, 17) // Orange color
  doc.text('SecureDigital', 20, 30)
  
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Account Statement', 20, 45)
  
  // Add user info
  doc.setFontSize(12)
  doc.text(`Account Holder: ${user.name}`, 20, 60)
  doc.text(`Email: ${user.email}`, 20, 70)
  doc.text(`Statement Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 20, 80)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 90)
  
  // Add line separator
  doc.setDrawColor(255, 127, 17)
  doc.setLineWidth(0.5)
  doc.line(20, 95, 190, 95)
  
  // Add transactions table header
  let yPosition = 110
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(255, 127, 17)
  doc.rect(20, yPosition - 5, 170, 8, 'F')
  
  doc.text('Date', 25, yPosition)
  doc.text('Type', 50, yPosition)
  doc.text('Description', 80, yPosition)
  doc.text('Amount (₹)', 150, yPosition)
  
  // Add transactions
  doc.setTextColor(0, 0, 0)
  yPosition += 10
  
  transactions.forEach((transaction, index) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }
    
    const date = new Date(transaction.createdAt).toLocaleDateString()
    const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)
    
    let description = transaction.description || ''
    if (transaction.type === 'transfer') {
      if (transaction.senderName && transaction.receiverName) {
        description = `From: ${transaction.senderName} | To: ${transaction.receiverName}`
      } else if (transaction.senderName) {
        description = `From: ${transaction.senderName}`
      } else if (transaction.receiverName) {
        description = `To: ${transaction.receiverName}`
      }
    }
    
    // Truncate description if too long
    if (description.length > 30) {
      description = description.substring(0, 27) + '...'
    }
    
    const amount = transaction.amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248)
      doc.rect(20, yPosition - 3, 170, 6, 'F')
    }
    
    doc.text(date, 25, yPosition)
    doc.text(type, 50, yPosition)
    doc.text(description, 80, yPosition)
    doc.text(amount, 150, yPosition)
    
    yPosition += 8
  })
  
  // Add summary
  yPosition += 10
  doc.setFontSize(12)
  doc.setTextColor(255, 127, 17)
  doc.text('Summary', 20, yPosition)
  
  yPosition += 10
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  
  const totalTransactions = transactions.length
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const deposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0)
  const withdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0)
  const transfers = transactions.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0)
  
  doc.text(`Total Transactions: ${totalTransactions}`, 20, yPosition)
  yPosition += 8
  doc.text(`Total Amount: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20, yPosition)
  yPosition += 8
  doc.text(`Deposits: ₹${deposits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20, yPosition)
  yPosition += 8
  doc.text(`Withdrawals: ₹${withdrawals.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20, yPosition)
  yPosition += 8
  doc.text(`Transfers: ₹${transfers.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 20, yPosition)
  
  // Add footer
  yPosition += 20
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('SecureDigital - Secure Banking Solutions', 20, yPosition)
  
  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}
