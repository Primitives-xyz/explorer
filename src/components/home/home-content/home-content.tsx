'use client'

import { MotionCard } from '@/components/motion/components/motion-card'
import { CardContent, CardHeader, CardTitle } from '@/components/ui'
import { AnimationProps, motion } from 'framer-motion'

export function HomeContent() {
  const containerAnimationVariants: AnimationProps['variants'] = {
    visible: {
      transition: {
        // staggerChildren: 10,
        staggerChildren: 0.2,
        // delayChildren: 0.2,
      },
    },
  }

  const itemAnimationVariants: AnimationProps['variants'] = {
    // hidden: {
    //   opacity: 0,
    //   y: 30,
    // },
    // visible: {
    //   opacity: 1,
    //   y: 0,
    //   transition: {
    //     duration: 0.3,
    //   },
    // },
    hidden: {
      opacity: 0,
      scale: 0.85,
    },
    visible: {
      opacity: 1,
      scale: 1,
      // transition: {
      //   type: 'spring',
      //   stiffness: 200,
      //   damping: 10,
      // },
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
  }

  return (
    <div className="w-full pb-6">
      {/* <FollowingTransactions /> */}

      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerAnimationVariants}
      >
        <motion.div
          variants={itemAnimationVariants}
          // onAnimationComplete={(definition) => {
          //   if (definition === 'visible') {
          //     // This will fire when the animation to "visible" completes
          //     console.log('Animation completed - element is now visible')
          //   }
          // }}
        >
          <MotionCard>
            <CardHeader>
              <CardTitle>Hello World!</CardTitle>
            </CardHeader>
            <CardContent>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Aspernatur nam eum, ipsam sequi, quas dolore ipsum magni qui
              laboriosam doloremque architecto cupiditate, numquam non ad
              ratione temporibus sapiente mollitia consequatur!
            </CardContent>
          </MotionCard>
        </motion.div>
        <motion.div variants={itemAnimationVariants}>
          <MotionCard>
            <CardHeader>
              <CardTitle>Hello World!</CardTitle>
            </CardHeader>
            <CardContent>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Aspernatur nam eum, ipsam sequi, quas dolore ipsum magni qui
              laboriosam doloremque architecto cupiditate, numquam non ad
              ratione temporibus sapiente mollitia consequatur! Lorem ipsum
              dolor sit amet consectetur adipisicing elit. Aspernatur nam eum,
              ipsam sequi, quas dolore ipsum magni qui laboriosam doloremque
              architecto cupiditate, numquam non ad ratione temporibus sapiente
              mollitia consequatur! Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Aspernatur nam eum, ipsam sequi, quas dolore
              ipsum magni qui laboriosam doloremque architecto cupiditate,
              numquam non ad ratione temporibus sapiente mollitia consequatur!
            </CardContent>
          </MotionCard>
        </motion.div>
      </motion.div>
    </div>
  )
}
