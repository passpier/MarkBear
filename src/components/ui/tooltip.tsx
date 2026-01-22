import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: string
}

export function Tooltip({ children, content }: TooltipProps) {
  const [show, setShow] = React.useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className={cn(
          "absolute z-50 px-3 py-1.5 text-sm text-primary-foreground",
          "bg-primary rounded-md shadow-md whitespace-nowrap",
          "bottom-full left-1/2 -translate-x-1/2 mb-2"
        )}>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
        </div>
      )}
    </div>
  )
}
