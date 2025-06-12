'use client'

import { ScrollingText } from '@/components/ui/scrolling-text'
import { useActivityTape } from '../hooks/use-get-feed'
import { ActivityTapeEntry } from './activity-tape-entry'

export function ActivityTape() {
  const { data } = useActivityTape()

  return (
    <div className="hidden md:flex fixed top-0 left-0 right-0 inset-x-0 p-2 z-40 overflow-hidden">
      <ScrollingText
        entries={data.activities?.map((activity, index) => (
          <ActivityTapeEntry key={index} activity={activity} />
        ))}
        duration={20}
      />
    </div>
  )
}
