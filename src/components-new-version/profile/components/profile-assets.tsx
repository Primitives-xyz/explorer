import { ProfileTokens } from './profile-tokens'

interface Props {
  walletAddress: string
}

export function ProfileAssets({ walletAddress }: Props) {
  return (
    <>
      <ProfileTokens walletAddress={walletAddress} />
    </>
  )
}
