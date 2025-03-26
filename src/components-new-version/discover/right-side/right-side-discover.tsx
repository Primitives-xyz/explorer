'use client'

import { FollowButton } from '@/components-new-version/common/follow-button'
import { DataTable } from '@/components-new-version/common/table/data-table'
import { WalletAddressButton } from '@/components-new-version/common/wallet-address-button'
import { IGetProfilesResponseEntry } from '@/components-new-version/models/profiles.models'
import { useGetAllProfiles } from '@/components-new-version/tapestry/hooks/use-get-all-profiles'
import { Button, ButtonVariant } from '@/components-new-version/ui'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { route } from '@/components-new-version/utils/route'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { ColumnDef } from '@tanstack/react-table'

export function RightSideDiscover() {
  const { profiles, loading } = useGetAllProfiles()
  const { mainUsername } = useCurrentWallet()

  const columns: ColumnDef<IGetProfilesResponseEntry>[] = [
    {
      id: 'profile.username',
      header: 'Recent Profiles',
      enableSorting: false,
      cell: ({ row }) => {
        const { wallet, profile } = row.original
        const isSame = wallet.address === profile.username

        return (
          <span className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar size={32} username={profile.username} />
              <div className="flex flex-col">
                {!isSame && (
                  <Button
                    variant={ButtonVariant.GHOST}
                    href={route('address', { id: profile.username })}
                    className="p-0 w-fit hover:bg-transparent"
                  >
                    @{profile.username}
                  </Button>
                )}
                <WalletAddressButton walletAddress={wallet.address} />
              </div>
            </div>
            <FollowButton
              small
              followerUsername={mainUsername}
              followeeUsername={row.original.profile.username}
            />
          </span>
        )
      },
    },
  ]

  return (
    <div className="pt-[100px] space-y-4 flex flex-col">
      <DataTable
        data={profiles?.profiles || []}
        columns={columns}
        isLoading={loading}
        withPagination
      />
    </div>
  )
}
