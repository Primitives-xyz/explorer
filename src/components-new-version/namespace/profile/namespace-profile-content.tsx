'use client'

import { useNamespaceProfile } from '@/components-new-version/namespace/hooks/use-namespace-profile'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'

interface Props {
  namespace: string
  profile: string
}

export function NamespaceProfileContent({
  namespace,
  profile: profileId,
}: Props) {
  const { mainProfile } = useCurrentWallet()

  const { profileData } = useNamespaceProfile({
    username: profileId,
    mainUsername: mainProfile?.username,
    namespace,
  })

  return <div>Namespace Profile Content</div>
}
