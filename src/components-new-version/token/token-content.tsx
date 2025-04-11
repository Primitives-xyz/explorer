import { fetchTokenInfo } from '@/components-new-version/utils/helius/das-api'
import { ProfileContent } from '../profile/components/profile-content'

export async function TokenContent({ id }: { id: string }) {
  let tokenInfo = null

  try {
    tokenInfo = await fetchTokenInfo(id)
  } catch (error) {
    console.error('Error fetching token info:', error)
    return <ProfileContent walletAddress={id} />
  }

  if (!tokenInfo?.result) {
    return <ProfileContent walletAddress={id} />
  }
}
