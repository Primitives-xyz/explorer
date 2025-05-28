import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { NFTContent } from '@/components/nft/NFTContent'
import { ProfileWithUsername } from '@/components/profile/components/profile-with-username'
import { ProfileWithWallet } from '@/components/profile/components/profile-with-wallet'
import { BackgroundTheme } from '@/components/pudgy/components/background-theme'
import { SwapTray } from '@/components/swap/components/swap-tray'
import { IGetProfilesResponse } from '@/components/tapestry/models/profiles.models'
import TransactionDetails from '@/components/transactions/transaction-view'
import { fetchWrapper } from '@/utils/api'
import { SOL_MINT } from '@/utils/constants'
import { determineRouteType, ERouteType } from '@/utils/entity'
import { route } from '@/utils/route'
import { Connection } from '@solana/web3.js'
import { redirect } from 'next/navigation'

export default async function EntityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cleanId = id.startsWith('@') ? id.slice(1) : id
  const connection = new Connection(
    process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
  )
  const routeType = await determineRouteType(id, connection)

  if (routeType === ERouteType.TOKEN) {
    redirect(
      route('trade', {
        inputMint: SOL_MINT,
        outputMint: cleanId,
      })
    )
  }

  async function renderContent(routeType: ERouteType, cleanId: string) {
    switch (routeType) {
      case ERouteType.TRANSACTION:
        return <TransactionDetails signature={cleanId} />
      case ERouteType.PROFILE:
        return <ProfileWithUsername username={cleanId} />
      case ERouteType.WALLET:
        const data = await fetchWrapper<IGetProfilesResponse>({
          endpoint: 'profiles',
          queryParams: {
            walletAddress: cleanId,
          },
        })
        const profile = data?.profiles?.[0]

        if (!!profile?.profile?.username) {
          return <ProfileWithUsername username={profile.profile.username} />
        } else {
          return <ProfileWithWallet walletAddress={cleanId} />
        }
      case ERouteType.NFT:
        return <NFTContent id={cleanId} />
      default:
        return <p>Unknown route type</p>
    }
  }

  const isPudgy = false

  return (
    <>
      {isPudgy && <BackgroundTheme />}
      <MainContentWrapper className="relative">
        <div className="md:pr-[36px]">{renderContent(routeType, cleanId)}</div>
      </MainContentWrapper>
      <SwapTray />
    </>
  )
}
