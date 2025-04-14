import { FollowButton } from '@/components/common/follow-button'
import Image from 'next/image'

interface Props {
  mainUsername: string
  username: string
  image?: string
  info?: string
}

export function FollowUserEntry({
  mainUsername,
  username,
  image,
  info,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[64px] aspect-square rounded-full bg-muted overflow-hidden shrink-0">
        {image && (
          <Image
            src={image}
            alt={username}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex justify-between w-full">
        <div className="flex flex-col justify-center gap-1">
          <p className="text-sm font-semibold truncate max-w-[6rem]">
            {username}
          </p>
          {info && <p className="text-xs text-muted-foreground">{info}</p>}
        </div>
        <FollowButton
          followerUsername={mainUsername}
          followeeUsername={username}
          className="w-[121px]"
        />
      </div>
    </div>
  )
}
