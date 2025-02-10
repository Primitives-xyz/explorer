'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { GraphContainer } from '@/components/graph-visualization/social-graph/components/graph-container'
import { useGetConnectionFromProfile } from '@/hooks/use-get-connection-from-profile'

export function GraphVisualizationContainer() {
  const { isLoggedIn, mainUsername } = useCurrentWallet()
  //const { data, loading } = useGetConnectionFromProfile(mainUsername)

  const { data, loading } = useGetConnectionFromProfile('nehemiah')

  console.log({ data })

  if (!isLoggedIn) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center">
        <p>connect your wallet</p>
      </div>
    )
  }

  if (!mainUsername) {
    return (
      <div className="h-[600px] w-full flex items-center justify-center">
        <p>you don't have a username linked to your wallet</p>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full flex items-center justify-center">
      {loading ? '...' : <GraphContainer username={'nehemiah'} />}
    </div>
  )
}
