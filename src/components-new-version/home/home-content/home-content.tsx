import { FollowingTransactionsWrapper } from './following-transactions/following-transactions-wrapper'

export function HomeContent() {
  return (
    <div className="w-full">
      {/* <Summary /> */}
      <FollowingTransactionsWrapper />
    </div>
  )
}
