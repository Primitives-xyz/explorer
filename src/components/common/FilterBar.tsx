import { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  accentColor?: 'green' | 'indigo'
  className?: string
}

export const FilterBar = ({
  children,
  accentColor = 'green',
  className = '',
}: FilterBarProps) => {
  const colorClasses = {
    green: 'border-green-800/30',
    indigo: 'border-indigo-800/30',
  }

  return (
    <div
      className={`border-b ${colorClasses[accentColor]} p-2 flex-shrink-0 ${className}`}
    >
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
        {children}
      </div>
    </div>
  )
}
