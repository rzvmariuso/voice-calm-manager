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
    <Card className="shadow-soft card-interactive hover:shadow-elegant group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-200" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">{value}</div>
        {change && (
          <p className={`text-xs ${changeColor} mt-1 opacity-80 group-hover:opacity-100 transition-opacity duration-200`}>
            {change}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1 opacity-70 group-hover:opacity-90 transition-opacity duration-200">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}