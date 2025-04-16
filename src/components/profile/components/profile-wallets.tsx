'use client'

import { useGetIdentities } from '@/components/tapestry/hooks/use-get-identities'
import { IGetProfilesResponseEntry } from '@/components/tapestry/models/profiles.models'
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
import { abbreviateWalletAddress } from '@/utils/utils'
import { ProfileWalletContent } from './profile-wallet-content'

interface Props {
  walletAddress: string
}

export function ProfileWallets({ walletAddress }: Props) {
  const { identities, loading } = useGetIdentities({
    walletAddress,
  })

  const displayedWallets = identities
    ?.filter((identity) => !!identity?.wallet?.address)
    .filter(
      (identity, index, self) =>
        self.findIndex(
          (other) =>
            other?.wallet?.address.toLowerCase() ===
            identity?.wallet?.address.toLowerCase()
        ) === index
    )
    .filter(
      (identity) => !identity?.wallet?.address.startsWith('0x')
    ) as (IGetProfilesResponseEntry & {
    wallet: {
      address: string
    }
  })[]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Wallets</CardTitle>
      </CardHeader>
      <CardContent>
        {!!displayedWallets?.length && (
          <Tabs defaultValue={displayedWallets?.[0]?.wallet?.address}>
            <TabsList className="w-full">
              {displayedWallets?.map((identity) => (
                <TabsTrigger
                  key={identity.wallet.address}
                  variant={TabVariant.SOCIAL}
                  value={identity.wallet.address}
                  className="flex-1"
                >
                  {abbreviateWalletAddress({
                    address: identity.wallet.address,
                  })}
                </TabsTrigger>
              ))}
            </TabsList>
            {displayedWallets?.map((identity) => (
              <TabsContent
                key={identity.wallet.address}
                value={identity.wallet.address}
              >
                <ProfileWalletContent walletAddress={identity.wallet.address} />
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
