import { cn } from '@/utils'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function MainContentWrapper({ children, className }: Props) {
  return <div className={cn('flex-1 px-6', className)}>{children}</div>
}
