'use client'

import { SigmaContainer } from '@react-sigma/core'
import { useState } from 'react'
import { SocialGraphControls } from './social-graph-controls'
import { SocialGraphLayout } from './social-graph-layout'

import type { IGraph } from '@/components/graph-visualization/social-graph/social-graph.models'
import { GraphContent } from '@/components/graph-visualization/social-graph/components/graph-content'

interface Props {
  data: IGraph
  username: string
  setCurrentUsername: (username?: string) => void
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
