import { getDicebearUrl } from '@/lib/constants'
import Image from 'next/image'

interface AvatarProps {
  username: string
  size?: number
}

export function Avatar({ username, size = 32 }: AvatarProps) {
  const dicebearUrl = getDicebearUrl(username)

  console.log('$$$$', dicebearUrl)

  return (
    <Image
      src={dicebearUrl}
      alt={`Avatar for ${username}`}
      width={size}
      height={size}
      className="rounded-full"
    />
  )
}
