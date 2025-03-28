import { getDicebearUrl } from '@/utils/constants'
import { cn } from '@/utils/utils'
import Image from 'next/image'
import { useState } from 'react'

interface AvatarProps {
  username: string
  size?: number
  imageUrl?: string | null
  className?: string
}

export function Avatar({
  username,
  size = 32,
  imageUrl,
  className,
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
        'relative inline-block overflow-hidden rounded-full bg-card',
        className
      )}
    >
      <div className="h-full w-full">
        <Image
          src={finalImageUrl}
          alt={`Avatar for ${username}`}
          width={size}
          height={size}
          className="rounded-full object-cover aspect-square"
          onError={() => setImageError(true)}
          unoptimized={finalImageUrl === dicebearUrl}
        />
      </div>
    </div>
  )
}
