'use client'

import { useNamespaceProfile } from '@/components/namespace/hooks/use-namespace-profile'
import { NamespaceProfileCardInfos } from '@/components/namespace/profile/namespace-profile-card-infos'
import { NamespaceProfileHeader } from '@/components/namespace/profile/namespace-profile-header'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface Props {
  namespace: string
  profile: string
}

export function NamespaceProfileContent({
  namespace,
  profile: username,
}: Props) {
  const { mainProfile } = useCurrentWallet()
  const { profileData } = useNamespaceProfile({
    username: username,
    mainUsername: mainProfile?.username,
    namespace,
  })

  if (!profileData || !profileData.profile || !profileData.namespace) {
    return null
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      <NamespaceProfileHeader
        profileData={profileData}
        username={username}
        namespace={namespace}
      />
      <div className="flex w-full justify-between gap-6">
        <NamespaceProfileCardInfos
          profileData={profileData}
          username={username}
        />
      </div>
    </div>
  )
}
