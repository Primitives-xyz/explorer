'use client'

import { IGetProfileOwnSpecificToken } from '@/components/tapestry/models/token.models'
import { Button, ButtonVariant } from '@/components/ui'
import { ValidatedImage } from '@/components/ui/validated-image/validated-image'
import { route } from '@/utils/route'
import { cn } from '@/utils/utils'

interface Props {
  data: IGetProfileOwnSpecificToken
}

export function TokenHolders({ data }: Props) {
  if (data.totalAmount === 0) {
    return null
  }

  return (
    <div className="flex text-xs text-muted-foreground">
      <div
        className={cn(
          'relative flex',
          data.totalAmount === 1 ? 'mr-6' : 'mr-8'
        )}
      >
        {data?.profiles.slice(0, 2).map((profile, index) => (
          <div
            key={profile.id}
            className={cn(
              'absolute w-[16px] h-[16px] rounded-full border-1',
              index === 0 ? 'left-0 z-10' : 'left-3 z-20'
            )}
          >
            {profile.image && (
              <ValidatedImage
                src={profile.image}
                alt="profile"
                fill
                sizes="100%"
                className="rounded-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap">
        {data?.profiles.slice(0, 2).map((profile, index, arr) => (
          <span key={profile.id} className="font-bold mr-1">
            <Button
              variant={ButtonVariant.LINK}
              className="text-xs font-bold"
              href={route('entity', { id: profile.id })}
            >
              {profile.username}
            </Button>
            {index < arr.length - 1 && ', '}
          </span>
        ))}
        {data?.totalAmount && data.totalAmount > 2 && (
          <span>and +{data.totalAmount - 2} others own this</span>
        )}

        {data?.totalAmount && data.totalAmount <= 2 && <span>own this</span>}
      </div>
    </div>
  )
}
