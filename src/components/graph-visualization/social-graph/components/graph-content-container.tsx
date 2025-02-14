'use client'

import { SigmaContainer } from '@react-sigma/core'
import { SocialGraphControls } from './social-graph-controls'
import { SocialGraphLayout } from './social-graph-layout'

import { GraphContent } from '@/components/graph-visualization/social-graph/components/graph-content'
import type { IGraph } from '@/components/graph-visualization/social-graph/social-graph.models'

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
