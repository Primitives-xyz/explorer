'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/popover/tooltip'

interface Props {
  content: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function InfoTip({ content, children, className }: Props) {
  const trigger = children ?? (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center cursor-help ${className || ''}`}
          >
            {trigger}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs text-xs leading-relaxed"
          displayArrow
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function HeaderWithInfo({
  label,
  info,
}: {
  label: string
  info: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      <InfoTip content={info} />
    </span>
  )
}
