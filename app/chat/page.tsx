import ChatInterface from '@/components/ChatInterface'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { 
  Button 
} from "@/components/ui/button"
import { 
  Badge 
} from "@/components/ui/badge"
import { 
  Alert, 
  AlertDescription 
} from "@/components/ui/alert"
import { 
  Mail, 
  HelpCircle, 
  ArrowRightLeft,
  Home,
  History
} from "lucide-react"
import Link from 'next/link'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Banking Assistant</h1>
          <p className="text-muted-foreground text-lg">
            Get instant help with your banking questions
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="h-[700px]">
              <ChatInterface />
            </div>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>Common Questions</span>
                </CardTitle>
                <CardDescription>
                  Quick answers to frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transfer Limits</span>
                    <Badge variant="secondary">₹0.01 - ₹100,000</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transfer Fees</span>
                    <Badge variant="outline">No fees</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Time</span>
                    <Badge variant="outline">Instant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security</span>
                    <Badge variant="default">Bank-level</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Need More Help?</p>
                  <p className="text-sm">
                    If the assistant can&apos;t help, contact our support team.
                  </p>
                  <a
                    href="mailto:support@nextbank.com"
                    className="text-sm text-primary hover:underline"
                  >
                    support@nextbank.com
                  </a>
                </div>
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Navigate to common banking features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/transfer">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Make Transfer
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/transactions">
                    <History className="mr-2 h-4 w-4" />
                    View Transactions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
