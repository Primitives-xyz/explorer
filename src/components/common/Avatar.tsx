import Image from 'next/image'

interface AvatarProps {
  username: string
  size?: number
  className?: string
}

export function Avatar({ username, size = 24, className = '' }: AvatarProps) {
  const dicebearUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={dicebearUrl}
        alt={username}
        className="w-full h-full rounded-lg bg-black/40 ring-1 ring-green-500/20"
      />
    </div>
  )
}
