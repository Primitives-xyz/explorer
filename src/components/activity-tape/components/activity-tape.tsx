'use client'

import { ScrollingText } from '@/components/ui/scrolling-text'
import { useGetFeed } from '../hooks/use-get-feed'
import { ActivityTapeEntry } from './activity-tape-entry'

export function ActivityTape() {
  const { transactions } = useGetFeed()

  return (
    <div className="hidden md:flex fixed top-0 left-0 right-0 inset-x-0 p-2 z-40 overflow-hidden">
      <ScrollingText
        entries={transactions?.map((activity, index) => (
          <ActivityTapeEntry key={index} activity={activity} />
        ))}
        duration={20}
      />
    </div>
  )
}
