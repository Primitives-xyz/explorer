'use client'

import { GraphContainer } from '@/components/graph-visualization/social-graph/components/graph-container'
import { useGetConnectionFromProfile } from '@/hooks/use-get-connection-from-profile'

export function GraphVisualizationContainer() {
  //const { mainUsername } = useCurrentWallet()
  //const { data } = useGetConnectionFromProfile(mainUsername)

  const { data } = useGetConnectionFromProfile('nehemiah')

  console.log({ data })

  return (
    <div className="h-[600px] w-full">
      <GraphContainer username={'nehemiah'} />
    </div>
  )
}
