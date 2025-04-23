'use client'

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
import { useGetProfileExternalNamespaces } from '../hooks/use-get-profile-external-namespace'
import { ProfileExternalProfile } from './profile-external-profile'

interface Props {
  walletAddress: string
}

export function ProfileSocial({ walletAddress }: Props) {
  const { namespaces, loading } = useGetProfileExternalNamespaces({
    walletAddress,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social</CardTitle>
      </CardHeader>
      <CardContent>
        {!!namespaces?.length && (
          <Tabs defaultValue={namespaces?.[0]?.namespace.name}>
            <div className="overflow-auto w-full">
              <TabsList>
                {namespaces.map((namespace) => (
                  <TabsTrigger
                    key={namespace.namespace.name}
                    variant={TabVariant.SOCIAL}
                    value={namespace.namespace.name}
                    className="flex-1 gap-1.5"
                  >
                    <div className="w-5 h-5 shrink-0">
                      <Image
                        src={namespace.namespace.faviconURL}
                        alt=""
                        width={16}
                        height={16}
                        className="w-full h-full"
                      />
                    </div>{' '}
                    <span>{namespace.namespace.readableName}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {namespaces.map((namespace) => (
              <TabsContent
                key={namespace.namespace.name}
                value={namespace.namespace.name}
                className="space-y-4"
              >
                {namespace.profiles.map((profile) => (
                  <ProfileExternalProfile
                    key={profile.profile.id}
                    profile={profile}
                  />
                ))}
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
