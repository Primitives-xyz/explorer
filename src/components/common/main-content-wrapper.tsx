import { cn } from '@/utils/utils'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function MainContentWrapper({ children, className }: Props) {
  return (
    <div
      className={cn(
        'flex-1 px-6 w-full max-w-full md:max-w-5xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}
