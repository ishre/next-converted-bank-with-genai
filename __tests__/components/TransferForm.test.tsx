import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransferForm from '@/components/TransferForm'

// Mock fetch
global.fetch = jest.fn()

describe('TransferForm', () => {
  const mockOnTransferSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('renders transfer form correctly', () => {
    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={1000} 
      />
    )
    
    expect(screen.getByText(/transfer funds/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/recipient email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /transfer/i })).toBeInTheDocument()
  })

  it('shows validation error for empty recipient email', async () => {
    const user = userEvent.setup()
    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={1000} 
      />
    )
    
    await user.type(screen.getByLabelText(/amount/i), '100')
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={1000} 
      />
    )
    
    await user.type(screen.getByLabelText(/recipient email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/amount/i), '100')
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    expect(screen.getByText(/email is invalid/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid amount', async () => {
    const user = userEvent.setup()
    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={1000} 
      />
    )
    
    await user.type(screen.getByLabelText(/recipient email/i), 'recipient@example.com')
    await user.type(screen.getByLabelText(/amount/i), '-50')
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    expect(screen.getByText(/amount must be a positive number/i)).toBeInTheDocument()
  })

  it('shows error for insufficient balance', async () => {
    const user = userEvent.setup()
    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={50} 
      />
    )
    
    await user.type(screen.getByLabelText(/recipient email/i), 'recipient@example.com')
    await user.type(screen.getByLabelText(/amount/i), '100')
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    expect(screen.getByText(/insufficient balance for this transfer/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Transfer successful'
      })
    })

    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={1000} 
      />
    )
    
    await user.type(screen.getByLabelText(/recipient email/i), 'recipient@example.com')
    await user.type(screen.getByLabelText(/amount/i), '100')
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: 'recipient@example.com',
          amount: 100
        })
      })
    })

    expect(mockOnTransferSuccess).toHaveBeenCalled()
    expect(screen.getByText(/transfer successful/i)).toBeInTheDocument()
  })

  it('shows error message on failed transfer', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Recipient not found'
      })
    })

    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={1000} 
      />
    )
    
    await user.type(screen.getByLabelText(/recipient email/i), 'nonexistent@example.com')
    await user.type(screen.getByLabelText(/amount/i), '100')
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    await waitFor(() => {
      expect(screen.getByText(/recipient not found/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={1000} 
      />
    )
    
    await user.type(screen.getByLabelText(/recipient email/i), 'recipient@example.com')
    await user.type(screen.getByLabelText(/amount/i), '100')
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    expect(screen.getByText(/transferring/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /transferring/i })).toBeDisabled()
  })

  it('clears form after successful transfer', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Transfer successful'
      })
    })

    render(
      <TransferForm 
        onTransferSuccess={mockOnTransferSuccess} 
        currentBalance={1000} 
      />
    )
    
    await user.type(screen.getByLabelText(/recipient email/i), 'recipient@example.com')
    await user.type(screen.getByLabelText(/amount/i), '100')
    await user.click(screen.getByRole('button', { name: /transfer/i }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('')).toBeInTheDocument()
    })
  })
})
