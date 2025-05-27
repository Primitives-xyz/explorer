'use client'

import { cn } from '@/utils/utils'
import Image from 'next/image'
import { EPudgyTheme } from '../pudgy.models'
import { usePudgyStore } from '../stores/use-pudgy-store'

export function BackgroundTheme() {
  const { theme } = usePudgyStore()

  return (
    <div
      className={cn('fixed inset-0 z-0', {
        'background-gradient': theme === EPudgyTheme.DEFAULT,
        'background-gradient-blue': theme === EPudgyTheme.BLUE,
        'background-gradient-green': theme === EPudgyTheme.GREEN,
        'background-gradient-pink': theme === EPudgyTheme.PINK,
      })}
    >
      <Image
        src="/images/pudgy/mountains-desktop.webp"
        alt="Background Theme"
        className="absolute bottom-0 left-0 w-full z-0 opacity-60"
        width={2070}
        height={734}
      />
    </div>
  )
}
