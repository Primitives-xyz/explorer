'use client'

import { useGetConnectionFromProfile } from '@/hooks/use-get-connection-from-profile'

//import { FullPageSpinner } from '@ui/components/spinner'
//import '@react-sigma/core/lib/react-sigma.min.css'
import '@react-sigma/core/lib/style.css'

import dynamic from 'next/dynamic'

const SocialGraph = dynamic(() => import('./SocialGraph'), {
  ssr: false,
})

interface Props {
  username: string
}

export function SocialGraphContainer({ username }: Props) {
  const { data, loading: socialGraphLoading } =
    useGetConnectionFromProfile(username)

  return <>{!!data && <SocialGraph data={data} username={username} />}</>
}
