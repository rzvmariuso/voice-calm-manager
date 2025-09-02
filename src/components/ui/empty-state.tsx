import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 px-6", className)}>
      <div className="mx-auto mb-6 animate-bounce-gentle">
        <Icon className="w-16 h-16 text-muted-foreground/50 mx-auto" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <Button 
          onClick={action.onClick}
          className="button-gradient hover:scale-105 transition-transform duration-200"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}