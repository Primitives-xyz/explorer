'use client'

import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabVariant,
} from '@/components/ui'
import Image from 'next/image'
import { ProfileExternalProfile } from './profile-external-profile'

interface Props {
  walletAddress: string
}

export function ProfileSocial({ walletAddress }: Props) {
  const { identities, loading } = useGetIdentities({
    walletAddress,
  })

  console.log('identities', identities)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social</CardTitle>
      </CardHeader>
      <CardContent>
        {!!identities?.length && (
          <Tabs
            defaultValue={
              identities?.[0]?.namespace.name + identities?.[0]?.profile?.id
            }
          >
            <div className="overflow-auto w-full">
              <TabsList>
                {identities.map((identity) => (
                  <TabsTrigger
                    key={identity.namespace.name + identity.profile.id}
                    variant={TabVariant.SOCIAL}
                    value={identity.namespace.name + identity.profile.id}
                    className="flex-1 gap-1.5"
                  >
                    <div className="w-5 h-5 shrink-0">
                      <Image
                        src={identity.namespace.faviconURL}
                        alt=""
                        width={16}
                        height={16}
                        className="w-full h-full"
                      />
                    </div>{' '}
                    <span>{identity.namespace.readableName}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {identities.map((identity) => (
              <TabsContent
                key={identity.namespace.name + identity.profile.id}
                value={identity.namespace.name + identity.profile.id}
              >
                <ProfileExternalProfile identity={identity} />
              </TabsContent>
            ))}
          </Tabs>
        )}
        {loading && (
          <div className="h-20 flex items-center justify-center">
            <Spinner />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
