'use client'

import { ScrollingText } from '@/components/ui/scrolling-text'
import { IActivityTapeEntry } from '../activity-tape.models'
import { useGetFeed } from '../hooks/use-get-feed'
import { ActivityTapeEntry } from './activity-tape-entry'

interface ActivityTapeProps {
  transactions?: IActivityTapeEntry[]
  className?: string
}

export function ActivityTape({
  transactions: propTransactions,
  className = 'hidden md:flex fixed top-0 left-0 right-0 inset-x-0 p-2 z-40',
}: ActivityTapeProps = {}) {
  const { transactions: hookTransactions } = useGetFeed()
  const transactions = propTransactions || hookTransactions

  return (
    <div className={`${className} overflow-hidden`}>
      <ScrollingText
        entries={transactions?.map((activity, index) => (
          <ActivityTapeEntry key={index} activity={activity} />
        ))}
        duration={20}
      />
    </div>
  )
}
