import { fetchTokenInfo } from '@/utils/helius/das-api'
import { ProfileWithWallet } from '../profile/components/profile-with-wallet'

export async function TokenContent({ id }: { id: string }) {
  let tokenInfo = null

  try {
    tokenInfo = await fetchTokenInfo(id)
  } catch (error) {
    console.error('Error fetching token info:', error)
    return <ProfileWithWallet walletAddress={id} />
  }

  if (!tokenInfo?.result) {
    return <ProfileWithWallet walletAddress={id} />
  }
}
