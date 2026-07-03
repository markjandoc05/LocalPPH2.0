import * as React from "react"
import { Card, CardContent } from "./Card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          {(description || trend) && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              {trend && (
                <span className={cn("font-medium", trend.positive ? "text-green-600" : trend.positive === false ? "text-red-600" : "text-slate-600")}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
              )}
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
