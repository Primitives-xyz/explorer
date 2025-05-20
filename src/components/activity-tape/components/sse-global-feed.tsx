import { useSseFeed } from '../hooks/use-sse-feed'
import { ActivityTape } from './activity-tape'

export function SseGlobalFeed() {
  const { transactions } = useSseFeed()

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">SSE Global Activity</h2>
      <ActivityTape
        transactions={transactions}
        className="flex w-full h-12 bg-background/80 backdrop-blur-sm rounded-lg"
      />
    </div>
  )
}
