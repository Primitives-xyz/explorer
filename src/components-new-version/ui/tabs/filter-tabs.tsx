'use client'

import { Button, ButtonVariant, TabVariant } from '@/components-new-version/ui'

interface FilterTabsProps<T extends string> {
  options: { label: string; value: T }[]
  selected: T
  onSelect?: (value: T) => void
  variant?: TabVariant
}

export function FilterTabs<T extends string>({
  options,
  selected,
  onSelect,
  variant = TabVariant.DEFAULT,
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
    <div className="flex items-center gap-2 mb-4">
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
