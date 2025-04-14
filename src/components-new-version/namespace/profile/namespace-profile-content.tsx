'use client'

import { useNamespaceProfile } from '@/components-new-version/namespace/hooks/use-namespace-profile'
import { NamespaceProfileCardInfos } from '@/components-new-version/namespace/profile/namespace-profile-card-infos'
import { NamespaceProfileHeader } from '@/components-new-version/namespace/profile/namespace-profile-header'
import { RelatedProfileTable } from '@/components-new-version/namespace/profile/related-profile-table'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'

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

  if (!profileData) {
    return null
  }

  return (
    <div className="flex flex-col w-full space-y-6">
      <NamespaceProfileHeader
        profileData={profileData}
        username={username}
        namespace={namespace}
      />
      <NamespaceProfileCardInfos
        profileData={profileData}
        username={username}
      />

      <RelatedProfileTable />
    </div>
  )
}
