import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loading({ size = "md", text = "Laden", className }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="text-center">
        <div className={cn("animate-spin rounded-full border-b-2 border-primary mx-auto mb-4", sizeClasses[size])}></div>
        <span className="text-muted-foreground loading-dots">{text}</span>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div className={cn("animate-spin rounded-full border-b-2 border-primary", sizeClasses[size], className)}></div>
  )
}

export function LoadingCard() {
  return (
    <div className="p-6 bg-background border border-border rounded-lg animate-fade-in">
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-pulse"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
      </div>
    </div>
  )
}