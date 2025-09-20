import ChatInterface from '@/components/ChatInterface'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Banking Assistant</h1>
          <p className="mt-2 text-gray-600">Get instant help with your banking questions</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="h-[600px]">
              <ChatInterface />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Common Questions</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Transfer Limits:</strong> Minimum $0.01, Maximum $100,000
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Transfer Fees:</strong> No fees for all transfers
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Processing Time:</strong> Instant transfers
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Security:</strong> Bank-level encryption
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Need More Help?</h4>
              <p className="text-sm text-blue-700 mb-3">
                If the assistant can&apos;t help, contact our support team.
              </p>
              <a
                href="mailto:support@nextbank.com"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                support@nextbank.com
              </a>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/dashboard"
                  className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  View Dashboard
                </a>
                <a
                  href="/transfer"
                  className="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  Make Transfer
                </a>
                <a
                  href="/transactions"
                  className="block w-full bg-gray-600 text-white text-center py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  View Transactions
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
