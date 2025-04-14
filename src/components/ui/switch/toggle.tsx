'use client'

import { cn } from '@/utils/utils'
import { useState } from 'react'
import { Button } from '../button'
import { Switch } from './switch'

export function Toggle() {
  const [checked, setChecked] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => setChecked(false)}
        className={cn('text-sm', {
          'text-muted-foreground': checked,
        })}
        isInvisible
      >
        Off
      </Button>
      <Switch checked={checked} onCheckedChange={setChecked} />
      <Button
        onClick={() => setChecked(true)}
        className={cn('text-sm', {
          'text-muted-foreground': !checked,
        })}
        isInvisible
      >
        On
      </Button>
    </div>
  )
}
