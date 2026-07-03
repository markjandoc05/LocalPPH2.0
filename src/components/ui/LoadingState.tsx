import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideLoader2 } from "lucide-react"

export function LoadingState({ className, text = "Loading..." }: { className?: string, text?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-slate-500", className)}>
      <LucideLoader2 className="w-8 h-8 mb-4 animate-spin text-blue-600" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  )
}
