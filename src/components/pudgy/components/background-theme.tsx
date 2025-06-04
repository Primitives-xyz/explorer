'use client'

import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import Image from 'next/image'
import { EPudgyTheme } from '../pudgy.models'

export function BackgroundTheme() {
  const { mainProfile } = useCurrentWallet()

  console.log('mainProfile', mainProfile)

  if (!mainProfile) {
    return null
  }

  return (
    <div
      className={cn('fixed inset-0 z-0', {
        'background-gradient': mainProfile?.pudgyTheme === EPudgyTheme.DEFAULT,
        'background-gradient-blue':
          mainProfile?.pudgyTheme === EPudgyTheme.BLUE,
        'background-gradient-green':
          mainProfile?.pudgyTheme === EPudgyTheme.GREEN,
        'background-gradient-pink':
          mainProfile?.pudgyTheme === EPudgyTheme.PINK,
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
