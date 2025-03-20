'use client'

import { cn } from '@/utils'
import { useState } from 'react'
import { Button } from '../button'
import { Switch } from './switch'

interface ToggleProps {
  defaultValue?: boolean
  onChange?: (value: boolean) => void
}

export const Toggle = ({ defaultValue = false, onChange }: ToggleProps) => {
  const [checked, setChecked] = useState(defaultValue)

  const handleCheck = (value: boolean) => {
    setChecked(value)
    onChange?.(value)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleCheck(false)}
        className={cn('text-sm', {
          'text-muted-foreground': checked,
        })}
        isInvisible
      >
      </Button>
      <Switch checked={checked} onCheckedChange={setChecked} />
      <Button
        onClick={() => handleCheck(true)}
        className={cn('text-sm', {
          'text-muted-foreground': !checked,
        })}
        isInvisible
      >
      </Button>
    </div>
  )
}
