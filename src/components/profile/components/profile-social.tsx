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
import { ProfileExternalProfile } from './profile-external-profile'

interface Props {
  walletAddress: string
}

export function ProfileSocial({ walletAddress }: Props) {
  const { identities, loading } = useGetIdentities({
    walletAddress,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social</CardTitle>
      </CardHeader>
      <CardContent>
        {!!identities?.length && (
          <Tabs defaultValue={identities?.[0]?.namespace.name}>
            <div className="overflow-auto w-full">
              <TabsList>
                {identities.map((identity) => (
                  <TabsTrigger
                    key={identity.namespace.name}
                    variant={TabVariant.SOCIAL}
                    value={identity.namespace.name}
                    className="flex-1 shrink-0"
                  >
                    {identity.namespace.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {identities.map((identity) => (
              <TabsContent
                key={identity.namespace.name}
                value={identity.namespace.name}
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
