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
        'w-8 aspect-square bg-muted shrink-0 rounded-full relative',
        className
      )}
    >
      <Image
        src={finalImageUrl}
        alt={`Avatar for ${username}`}
        width={size}
        height={size}
        className="rounded-full object-cover w-full h-full"
        onError={() => setImageError(true)}
        unoptimized={finalImageUrl === dicebearUrl}
      />
    </div>
  )
}
