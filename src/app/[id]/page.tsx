import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { NFTContent } from '@/components/nft/NFTContent'
import { ProfileWithUsername } from '@/components/profile/components/profile-with-username'
import { ProfileWithWallet } from '@/components/profile/components/profile-with-wallet'
import { SwapTray } from '@/components/swap/components/swap-tray'
import TransactionDetails from '@/components/transactions/transaction-view'
import { determineRouteType, RouteType } from '@/utils/entity'
import { Connection } from '@solana/web3.js'
import { redirect } from 'next/navigation'

export default async function Entity({
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

  if (routeType === RouteType.TOKEN) {
    redirect(
      `/trade?inputMint=So11111111111111111111111111111111111111112&outputMint=${cleanId}`
    )
  }

  function renderContent(routeType: RouteType, cleanId: string) {
    switch (routeType) {
      case RouteType.TRANSACTION:
        return <TransactionDetails signature={cleanId} />
      case RouteType.PROFILE:
        return <ProfileWithUsername username={cleanId} />
      case RouteType.WALLET:
        return <ProfileWithWallet walletAddress={cleanId} />
      case RouteType.NFT:
        return <NFTContent id={cleanId} />
      default:
        return <p>Unknown route type</p>
    }
  }

  return (
    <>
      <MainContentWrapper>
        <div className="md:pr-[36px]">{renderContent(routeType, cleanId)}</div>
      </MainContentWrapper>
      <SwapTray />
    </>
  )
}
