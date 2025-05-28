import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { NFTContent } from '@/components/nft/NFTContent'
import { ProfileWithUsername } from '@/components/profile/components/profile-with-username'
import { ProfileWithWallet } from '@/components/profile/components/profile-with-wallet'
import { SwapTray } from '@/components/swap/components/swap-tray'
import TransactionDetails from '@/components/transactions/transaction-view'
import { SOL_MINT } from '@/utils/constants'
import { determineRouteType, RouteType } from '@/utils/entity'
import { Connection } from '@solana/web3.js'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function Entity({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { namespace } = await searchParams

  const cleanId = id.startsWith('@') ? id.slice(1) : id
  const connection = new Connection(
    process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
  )
  const routeType = await determineRouteType(id, connection)
  console.log('routeType', routeType)
  if (routeType === RouteType.TOKEN) {
    redirect(`/trade?inputMint=${SOL_MINT}&outputMint=${cleanId}`)
  }

  function renderContent(routeType: RouteType, cleanId: string) {
    switch (routeType) {
      case RouteType.TRANSACTION:
        return <TransactionDetails signature={cleanId} />
      case RouteType.PROFILE:
        return <ProfileWithUsername username={cleanId} namespace={namespace as string} />
      case RouteType.WALLET:
        throw new Error(
          'WALLET routeType should be handled in the main function, not here.'
        )
      case RouteType.NFT:
        return <NFTContent id={cleanId} />
      default:
        return <p>Unknown route type</p>
    }
  }

  if (routeType === RouteType.WALLET) {
    // Get the host from headers for server-side fetch
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`
    
    const url = `${baseUrl}/api/profiles?walletAddress=${cleanId}`
    const res = await fetch(url)
    const data = await res.json()
    const profile = data?.profiles?.[0]
    if (profile && profile.profile?.username) {
      return (
        <>
          <MainContentWrapper>
            <div className="md:pr-[36px]">
              <ProfileWithUsername username={profile.profile.username} namespace={namespace as string} />
            </div>
          </MainContentWrapper>
          <SwapTray />
        </>
      )
    } else {
      return (
        <>
          <MainContentWrapper>
            <div className="md:pr-[36px]">
              <ProfileWithWallet walletAddress={cleanId} namespace={namespace as string} />
            </div>
          </MainContentWrapper>
          <SwapTray />
        </>
      )
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
