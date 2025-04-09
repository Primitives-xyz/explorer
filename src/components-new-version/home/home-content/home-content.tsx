import { FollowingTransactions } from '@/components-new-version/home/home-content/following-transactions/following-transactions'

interface Props {
  setOpenSwap?: (open: boolean) => void
}

export function HomeContent({ setOpenSwap }: Props) {
  return (
    <div className="w-full">
      <FollowingTransactions setOpenSwap={setOpenSwap} />
    </div>
  )
}
