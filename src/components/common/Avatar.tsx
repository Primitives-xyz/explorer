import { getDicebearUrl } from '@/lib/constants'
import Image from 'next/image'

interface AvatarProps {
  username: string
  size?: number
  imageUrl?: string | null
}

export function Avatar({ username, size = 32, imageUrl }: AvatarProps) {
  const dicebearUrl = getDicebearUrl(username)

  return (
    <Image
      src={imageUrl || dicebearUrl}
      alt={`Avatar for ${username}`}
      width={size}
      height={size}
      className="rounded-full"
    />
  )
}
