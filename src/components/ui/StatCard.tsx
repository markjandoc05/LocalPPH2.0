import * as React from "react"
import { Card, CardContent } from "./Card"
import { LucideArrowRight, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  href?: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, href, trend, className }: StatCardProps) {
  const content = (
    <>
      <CardContent className="p-3.5 sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-2">
          <h3 className="text-[11px] font-medium leading-tight text-slate-500 sm:text-sm">{title}</h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {href && (
              <LucideArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 sm:h-4 sm:w-4" />
            )}
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600 sm:p-2">
              <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
        <div>
          <div className="text-lg font-bold leading-none text-slate-900 sm:text-2xl">{value}</div>
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
    </>
  )

  const cardClassName = cn(
    "group overflow-hidden rounded-xl shadow-sm transition-all",
    href && "hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
    className
  )

  if (href) {
    return (
      <Link href={href} className={cn("block border border-slate-200 bg-white text-slate-950", cardClassName)}>
        {content}
      </Link>
    )
  }

  return (
    <Card className={cardClassName}>
      {content}
    </Card>
  )
}
