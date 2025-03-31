import { cn } from '@/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

export function RightSidebarWrapper({ children, className }: Props) {
  return (
    <div className={cn('relative h-full px-6', className)}>
      <div className="sticky top-[calc(var(--topbar-height)+1.25rem)] w-sidebar-right pb-6">
        {children}
      </div>
    </div>
  )
}
