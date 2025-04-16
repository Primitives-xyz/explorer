'use client'

import { INamespaceProfile } from '@/components/models/namespace.models'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, cn } from '@/utils/utils'

interface Props {
  profiles: INamespaceProfile[] | null
}

export function NamespaceProfiles({ profiles }: Props) {
  return (
    <Card>
      <CardHeader className="bg-card-accent grid grid-cols-3">
        <p>Namespace profiles</p>
        <p className="text-right">Followers</p>
        <p className="text-right">Followings</p>
      </CardHeader>
      <CardContent className="max-h-[calc(100vh-220px)] overflow-auto p-0">
        {profiles?.map((elem) => {
          return (
            <div
              key={elem.profile.username}
              className={cn(
                'px-6 py-4 grid grid-cols-3',
                profiles.indexOf(elem) !== profiles.length - 1 &&
                  'border-b border-card-border'
              )}
            >
              <div className="flex items-center gap-4">
                <Avatar size={32} username={elem.profile.username} />
                <div className="flex flex-col items-start w-2/3">
                  <Button
                    variant={ButtonVariant.GHOST}
                    href={
                      elem.namespace.name === EXPLORER_NAMESPACE
                        ? route('entity', {
                            id: elem.profile.username,
                          })
                        : route('namespaceProfile', {
                            id: elem.namespace.name,
                            profile: elem.profile.id,
                          })
                    }
                    className="flex flex-col h-auto items-start"
                  >
                    <p className="truncate text-foreground">
                      @{elem.profile.username}
                    </p>
                    <p>
                      {abbreviateWalletAddress({
                        address: elem.wallet.address,
                      })}
                    </p>
                  </Button>
                </div>
              </div>
              <div className="text-right flex items-center justify-end">
                {elem.socialCounts?.followers}
              </div>
              <div className="text-right flex items-center justify-end">
                {elem.socialCounts?.following}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
