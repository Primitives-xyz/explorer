'use client'

import { EPudgyTheme } from '@/components/pudgy/pudgy.models'
import { ValidatedImage } from '@/components/ui/validated-image/validated-image'
import { getDicebearUrl } from '@/utils/constants'
import { cn } from '@/utils/utils'
import Image from 'next/image'
import { useState } from 'react'

interface AvatarProps {
  username: string
  size?: number
  imageUrl?: string | null
  className?: string
  pudgyTheme?: EPudgyTheme
  displayPudgyFrame?: boolean
}

export function Avatar({
  username,
  size = 32,
  imageUrl,
  className,
  pudgyTheme,
  displayPudgyFrame,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const dicebearUrl = getDicebearUrl(username)

  // Normalize the image URL
  const normalizeImageUrl = (url: string | null | undefined) => {
    if (!url) return null
    // If it's already a dicebear URL, return as is
    if (url.includes('dicebear')) return url
    try {
      // Check if it's a valid URL
      new URL(url)
      return url
    } catch {
      // If it's a relative path, ensure it starts with a slash
      if (url.startsWith('/')) return url
      // If it's just a filename, assume it's in the root
      if (!url.includes('/')) return `/${url}`
      // Otherwise treat as relative path
      return url
    }
  }

  const finalImageUrl =
    !imageUrl || imageError
      ? dicebearUrl
      : normalizeImageUrl(imageUrl) || dicebearUrl

  return (
    <div
      className={cn(
        'w-8 aspect-square bg-muted shrink-0 rounded-full relative',
        className
      )}
    >
      <ValidatedImage
        src={finalImageUrl}
        alt={`Avatar for ${username}`}
        width={size}
        height={size}
        className="rounded-full object-cover w-full h-full"
        onError={() => setImageError(true)}
        unoptimized={finalImageUrl === dicebearUrl}
      />
      {!!displayPudgyFrame && (
        <div
          className={cn(
            'border-4 border-pudgy-border absolute top-0 left-0 inset-0 rounded-full overflow-hidden',
            {
              'border-[#72a0fe]': pudgyTheme === EPudgyTheme.BLUE,
              'border-primary': pudgyTheme === EPudgyTheme.GREEN,
              'border-[#ff93b0]': pudgyTheme === EPudgyTheme.PINK,
              'border-border': pudgyTheme === EPudgyTheme.DEFAULT,
            }
          )}
        >
          <Image
            src="/images/pudgy/pudgy-frame.webp"
            alt="Pudgy Frame"
            width={size}
            height={size}
            className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%]"
          />
        </div>
      )}
    </div>
  )
}
