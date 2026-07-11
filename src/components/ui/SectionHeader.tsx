import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function SectionHeader({ title, description, actions, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4", className)} {...props}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-[#0C0C1C]">{title}</h2>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
