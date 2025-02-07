'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { SocialGraphContainer } from '@/components/graph-visualization/social-graph/components/SocialGraphContainer'
import { useGetConnectionFromProfile } from '@/hooks/use-get-connection-from-profile'

export function GraphVisualizationContainer() {
  const { mainUsername } = useCurrentWallet()

  const { data } = useGetConnectionFromProfile('nehemiah')

  console.log({ data })

  return (
    <div className="h-[600px] w-full">
      <SocialGraphContainer username={'nehemiah'} />
    </div>
  )
}
