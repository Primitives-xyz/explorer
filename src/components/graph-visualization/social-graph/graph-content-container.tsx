'use client'

import { GraphContent } from '@/components/graph-visualization/social-graph/graph-content'
import type { IGraph } from '@/components/graph-visualization/social-graph/social-graph.models'
import { SigmaContainer } from '@react-sigma/core'
import { SocialGraphControls } from './social-graph-controls'
import { SocialGraphLayout } from './social-graph-layout'

interface Props {
  data: IGraph
  username: string
}

export default function GraphContentContainer({ data, username }: Props) {
  return (
    <SigmaContainer
      className="w-full h-full !bg-transparent"
      settings={{
        allowInvalidContainer: true,
        renderLabels: false,
      }}
    >
      <GraphContent data={data} username={username} />
      <SocialGraphLayout />
      <SocialGraphControls />
    </SigmaContainer>
  )
}
