'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { GraphContainer } from '@/components/graph-visualization/social-graph/components/graph-container'
import { useGetConnectionFromProfile } from '@/hooks/use-get-connection-from-profile'

export function GraphVisualizationContainer() {
  const { isLoggedIn, mainUsername, loadingProfiles } = useCurrentWallet()
  const { data, loading } = useGetConnectionFromProfile('nehemiah')

  console.log({ data })

  return (
    <div className="h-[600px] w-full flex items-center justify-center border-green-500 border">
      {loadingProfiles || loading ? (
        '...'
      ) : !isLoggedIn ? (
        <p>connect your wallet</p>
      ) : !mainUsername ? (
        <p>you don‘t have a username linked to your wallet</p>
      ) : (
        <GraphContainer username={'nehemiah'} />
      )}
    </div>
  )
}
