import { ProfileContent } from '@/components/profile/profile-content'
import { PublicKey } from '@solana/web3.js'
import PortfolioTabs from '../portfolio/[address]/PortfolioTabs'
import NFTDetails from '@/components/NFTDetails'

type Params = Promise<{ id: string }>

async function checkIsNFT(id: string) {
  try {
    const response = await fetch(`${process.env.RPC_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAsset',
        params: {
          id: id,
        },
      }),
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return !data.error
  } catch (error) {
    return false
  }
}

export default async function ProfilePage({ params }: { params: Params }) {
  const resolvedParams = await params
  const { id } = resolvedParams

  let isPublicKey = false
  let publicKey: PublicKey | null = null

  try {
    publicKey = new PublicKey(id)
    isPublicKey = true
  } catch (error) {
    isPublicKey = false
  }

  if (!isPublicKey) {
    return <ProfileContent username={id} />
  }

  // Check if this public key is an NFT
  const isNFT = await checkIsNFT(id)

  if (isNFT) {
    return <NFTDetails id={id} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-mono text-green-500 mb-8">Wallet: {id}</h1>
      <PortfolioTabs address={id} />
    </div>
  )
}

export const dynamic = 'force-dynamic'
