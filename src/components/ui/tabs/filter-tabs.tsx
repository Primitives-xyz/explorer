'use client'

import { Button, ButtonSize, ButtonVariant, TabVariant } from '@/components/ui'
import { cn } from '@/utils/utils'

interface FilterTabsProps<T extends string> {
  options: { label: string; value: T }[]
  selected: T
  variant?: TabVariant
  className?: string
  buttonClassName?: string
  size?: ButtonSize
  onSelect?: (value: T) => void
}

export function FilterTabs<T extends string>({
  options,
  selected,
  variant = TabVariant.DEFAULT,
  className,
  buttonClassName,
  size,
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
    <div className={cn(
      'flex items-center gap-2 mb-4',
      // Add horizontal scroll on mobile
      'max-sm:overflow-x-auto max-sm:scrollbar-hide',
      // Prevent wrapping on mobile
      'max-sm:flex-nowrap',
      className
    )}>
      {options.map((option) => (
        <Button
          key={option.value}
          className={cn(
            'rounded-full',
            // Ensure buttons don't shrink on mobile
            'max-sm:whitespace-nowrap max-sm:flex-shrink-0',
            buttonClassName
          )}
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
