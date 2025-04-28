import { MotionCard } from '@/components/motion/components/motion-card'
import { CardContent, CardHeader, CardTitle } from '@/components/ui'

export function HomeContent() {
  return (
    <div className="w-full pb-6">
      {/* <FollowingTransactions /> */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}

      <div className="space-y-6">
        <MotionCard>
          <CardHeader>
            <CardTitle>Hello World!</CardTitle>
          </CardHeader>
          <CardContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur
            nam eum, ipsam sequi, quas dolore ipsum magni qui laboriosam
            doloremque architecto cupiditate, numquam non ad ratione temporibus
            sapiente mollitia consequatur!
          </CardContent>
        </MotionCard>
        <MotionCard>
          <CardHeader>
            <CardTitle>Hello World!</CardTitle>
          </CardHeader>
          <CardContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur
            nam eum, ipsam sequi, quas dolore ipsum magni qui laboriosam
            doloremque architecto cupiditate, numquam non ad ratione temporibus
            sapiente mollitia consequatur! Lorem ipsum dolor sit amet
            consectetur adipisicing elit. Aspernatur nam eum, ipsam sequi, quas
            dolore ipsum magni qui laboriosam doloremque architecto cupiditate,
            numquam non ad ratione temporibus sapiente mollitia consequatur!
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur
            nam eum, ipsam sequi, quas dolore ipsum magni qui laboriosam
            doloremque architecto cupiditate, numquam non ad ratione temporibus
            sapiente mollitia consequatur!
          </CardContent>
        </MotionCard>
      </div>
    </div>
  )
}
