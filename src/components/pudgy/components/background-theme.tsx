'use client'

import { IProfile } from '@/components/tapestry/models/profiles.models'
import { cn } from '@/utils/utils'
import Image from 'next/image'
import { EPudgyTheme } from '../pudgy.models'

interface Props {
  profile: IProfile
}

export function BackgroundTheme({ profile }: Props) {
  return (
    <div
      className={cn('fixed inset-0 z-0', {
        'background-gradient': profile?.pudgyTheme === EPudgyTheme.DEFAULT,
        'background-gradient-blue': profile?.pudgyTheme === EPudgyTheme.BLUE,
        'background-gradient-green': profile?.pudgyTheme === EPudgyTheme.GREEN,
        'background-gradient-pink': profile?.pudgyTheme === EPudgyTheme.PINK,
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
