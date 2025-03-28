'use client'

import { Button, ButtonVariant } from '@/components-new-version/ui'

interface FilterTabsProps<T extends string> {
  options: { label: string; value: T }[]
  selected: T
  onSelect: (value: T) => void
}

export function FilterTabs<T extends string>({
  options,
  selected,
  onSelect,
}: FilterTabsProps<T>) {
  return (
    <div className="flex items-center gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          className="rounded-full"
          variant={
            selected === option.value
              ? ButtonVariant.DEFAULT
              : ButtonVariant.GHOST
          }
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
