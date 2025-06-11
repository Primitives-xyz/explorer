'use client'

import { cn } from '@/utils/utils'
import Image from 'next/image'
import { EPudgyTheme } from '../pudgy.models'

interface Props {
  pudgyTheme: EPudgyTheme
}

export function BackgroundTheme({ pudgyTheme }: Props) {
  return (
    <div
      className={cn('fixed inset-0 z-0 pointer-events-none', {
        // 'background-gradient': pudgyTheme === EPudgyTheme.DEFAULT,
        // 'background-gradient-blue': pudgyTheme === EPudgyTheme.BLUE,
        // 'background-gradient-green': pudgyTheme === EPudgyTheme.GREEN,
        // 'background-gradient-pink': pudgyTheme === EPudgyTheme.PINK,
      })}
    >
      {pudgyTheme !== EPudgyTheme.DEFAULT && (
        <Image
          src={`/images/pudgy/pudgy-bg-${pudgyTheme.toLowerCase()}.webp`}
          alt="Background Theme"
          className="absolute top-0 left-0 w-full h-full object-cover"
          width={1500}
          height={1006}
        />
      )}
      <Image
        src="/images/pudgy/mountains-desktop.webp"
        alt="Background Theme"
        className="absolute bottom-0 left-0 w-full opacity-90"
        width={1500}
        height={1006}
      />
      <div className="absolute top-0 left-0 inset-0 bg-black/10" />
    </div>
  )
}
