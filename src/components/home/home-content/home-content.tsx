import { MotionTest } from '@/components/motion/components/motion-test'

export function HomeContent() {
  return (
    <div className="w-full pb-6">
      {/* <FollowingTransactions /> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionTest />
        <MotionTest />
      </div>
    </div>
  )
}
