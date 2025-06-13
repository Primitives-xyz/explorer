'use client'

import { IProfile } from '@/components/tapestry/models/profiles.models'
import { Animate } from '@/components/ui'
import Image from 'next/image'
import { EPudgyTheme } from '../pudgy.models'

interface Props {
  profile: IProfile
}

export function BackgroundTheme({ profile }: Props) {
  const isPudgy = !!profile?.pudgy_profile_date
  const pudgyTheme = profile.pudgyTheme ?? EPudgyTheme.BLUE
  const isVisible = isPudgy && !!pudgyTheme

  return (
    <Animate
      isVisible={isVisible}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-0 pointer-events-none"
    >
      {!!pudgyTheme && pudgyTheme !== EPudgyTheme.DEFAULT && (
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
    </Animate>
  )
}
