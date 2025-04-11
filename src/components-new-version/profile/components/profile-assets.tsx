import { ProfileNfts } from './profile-nfts'
import { ProfileTokens } from './profile-tokens'

interface Props {
  walletAddress: string
}

export function ProfileAssets({ walletAddress }: Props) {
  return (
    <div className="space-y-4">
      <ProfileTokens walletAddress={walletAddress} />
      <ProfileNfts walletAddress={walletAddress} />
    </div>
  )
}
