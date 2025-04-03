'use client'

import { Button, ButtonVariant, TabVariant } from '@/components-new-version/ui'
import { cn } from '@/components-new-version/utils/utils'

interface FilterTabsProps<T extends string> {
  options: { label: string; value: T }[]
  selected: T
  variant?: TabVariant
  className?: string
  onSelect?: (value: T) => void
}

export function FilterTabs<T extends string>({
  options,
  selected,
  variant = TabVariant.DEFAULT,
  className,
  onSelect,
}: FilterTabsProps<T>) {
  const getVariant = (isActive: boolean) => {
    if (isActive) {
      if (variant === TabVariant.DEFAULT) {
        return ButtonVariant.DEFAULT
      } else {
        return ButtonVariant.DEFAULT_SOCIAL
      }
    } else {
      return ButtonVariant.GHOST
    }
  }

  return (
    <div className={cn('flex items-center gap-2 mb-4', className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          className="rounded-full"
          variant={getVariant(selected === option.value)}
          onClick={() => onSelect?.(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
