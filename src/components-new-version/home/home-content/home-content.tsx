import { FollowingTransactionsWrapper } from '@/components-new-version/home/home-content/following-transactions/following-transactions-wrapper'

interface Props {
  setOpenSwap?: (open: boolean) => void
}

export function HomeContent({ setOpenSwap }: Props) {
  return (
    <div className="w-full">
      {/* <Summary /> */}
      <FollowingTransactionsWrapper setOpenSwap={setOpenSwap} />
    </div>
  )
}
