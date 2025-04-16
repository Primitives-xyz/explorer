'use client'

import { ScrollingText } from '@/components/ui/scrolling-text'
import { useGetFeed } from '../hooks/use-get-feed'
import { ActivityTapeEntry } from './activity-tape-entry'

export function ActivityTape() {
  const { transactions } = useGetFeed()

  return (
    <div className="fixed top-0 left-0 right-0 inset-x-0 p-2 z-30 backdrop-blur-md overflow-hidden">
      <ScrollingText
        entries={transactions?.map((activity, index) => (
          <ActivityTapeEntry key={index} activity={activity} />
        ))}
        duration={200}
      />
    </div>
  )
}
