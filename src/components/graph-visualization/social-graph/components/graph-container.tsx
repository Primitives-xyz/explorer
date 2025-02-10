'use client'

import { useGetConnectionFromProfile } from '@/hooks/use-get-connection-from-profile'
import '@react-sigma/core/lib/style.css'

import dynamic from 'next/dynamic'

const GraphContentContainer = dynamic(
  () => import('./graph-content-container'),
  {
    ssr: false,
  },
)

interface Props {
  username: string
}

export function GraphContainer({ username }: Props) {
  const { data } = useGetConnectionFromProfile(username)

  return (
    <>{!!data && <GraphContentContainer data={data} username={username} />}</>
  )
}
