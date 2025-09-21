import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"

interface KYCStatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  size?: 'sm' | 'default' | 'lg'
}

export default function KYCStatusBadge({ status, size = 'default' }: KYCStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200',
          icon: Clock,
          text: 'Pending'
        }
      case 'APPROVED':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200',
          icon: CheckCircle,
          text: 'Approved'
        }
      case 'REJECTED':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200',
          icon: XCircle,
          text: 'Rejected'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  )
}
