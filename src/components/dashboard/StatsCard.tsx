import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
  description?: string
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  description 
}: StatsCardProps) {
  const changeColor = {
    positive: "text-success",
    negative: "text-destructive", 
    neutral: "text-muted-foreground"
  }[changeType]

  return (
    <Card className="shadow-soft card-interactive hover:shadow-elegant group h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors duration-200" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-semibold text-foreground mb-1">{value}</div>
        <div className="min-h-[2rem]">
          {change && (
            <p className={`text-xs ${changeColor} leading-relaxed`}>
              {change}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
