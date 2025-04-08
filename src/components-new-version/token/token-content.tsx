import { ProfileContent } from '@/components-new-version/profile/profile-content'
import { fetchTokenInfo } from '@/components-new-version/utils/helius/das-api'

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
