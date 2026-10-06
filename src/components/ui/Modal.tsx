import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideX } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, description, children, footer, className }: ModalProps) {
  const titleId = React.useId()
  const descriptionId = React.useId()
  const dialog = React.useRef<HTMLDivElement>(null)
  const close = React.useRef(onClose)
  React.useEffect(() => { close.current = onClose }, [onClose])
  React.useEffect(() => {
    if (!isOpen) return
    const previous = document.activeElement as HTMLElement | null
    const timer = setTimeout(() => dialog.current?.querySelector<HTMLElement>('button, input, textarea, select')?.focus(), 0)
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return }
      if (event.key !== 'Tab') return
      const elements = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]') || []).filter((element) => element.getClientRects().length)
      const first = elements[0], last = elements[elements.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', keyboard)
    return () => { clearTimeout(timer); document.removeEventListener('keydown', keyboard); previous?.focus() }
  }, [isOpen])
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} className={cn("relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh] overflow-hidden", className)}>
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">{title}</h2>
            {description && <p id={descriptionId} className="text-sm text-slate-600 mt-1">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
          >
            <LucideX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
