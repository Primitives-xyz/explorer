'use client'

import React from 'react'
import { Avatar } from './Avatar'
import Image from 'next/image'

interface ViewAvatarProps {
  type: 'profile' | 'token' | 'transaction'
  identifier: string
  imageUrl?: string
  size?: number
}

export function ViewAvatar({ type, identifier, imageUrl, size = 32 }: ViewAvatarProps) {
  if (type === 'token' && imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`Token ${identifier}`}
        width={size}
        height={size}
        className="rounded-full border border-green-500"
      />
    )
  }

  return <Avatar username={identifier} size={size} />
}
