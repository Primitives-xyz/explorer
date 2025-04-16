'use client'

import { Button, ButtonSize, ButtonVariant, TabVariant } from '@/components/ui'
import { cn } from '@/utils/utils'

interface FilterTabsProps<T extends string> {
  options: { label: string; value: T }[]
  selected: T
  variant?: TabVariant
  className?: string
  onSelect?: (value: T) => void
  size?: ButtonSize
}

export function FilterTabs<T extends string>({
  options,
  selected,
  variant = TabVariant.DEFAULT,
  className,
  onSelect,
  size,
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
          size={size}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
