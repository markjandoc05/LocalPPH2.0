import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideAlertCircle } from "lucide-react"
import { Button } from "./Button"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = "An error occurred", message, onRetry, className, ...props }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 bg-red-50 border border-red-100 rounded-xl text-center", className)} {...props}>
      <LucideAlertCircle className="w-10 h-10 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-red-900 mb-1">{title}</h3>
      <p className="text-sm text-red-700 max-w-sm mb-6">{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try Again</Button>}
    </div>
  )
}
