'use client'

import { ScrollingText } from '@/components/ui/scrolling-text'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivityTape } from '../hooks/use-activity-tape'
import { ActivityTapeEntry } from './activity-tape-entry'

export function ActivityTape() {
  const { data, loading } = useActivityTape()

  const entries = loading
    ? Array(5)
        .fill(null)
        .map((_, index) => (
          <div key={index} className="inline-flex items-center gap-2">
            <Skeleton
              className="h-6"
              randomWidthRange={{ min: 200, max: 200 }}
            />
          </div>
        ))
    : data.activities?.map((activity, index) => (
        <ActivityTapeEntry key={index} activity={activity} />
      ))

  return (
    <div className="hidden md:flex fixed top-0 left-0 right-0 inset-x-0 p-2 z-40 overflow-hidden">
      <ScrollingText entries={entries} duration={20} />
    </div>
  )
}
