'use client'

import { ITransactionWithProfile } from '@/components/transactions/hooks/use-following-transactions'
import { TransactionsEntry } from '@/components/transactions/transactions-entry'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { AnimationProps, motion } from 'framer-motion'
import { useEffect } from 'react'

interface Props {
  transactions: ITransactionWithProfile[]
}

export function FollowingTransactionsList({ transactions }: Props) {
  const { walletAddress } = useCurrentWallet()

  useEffect(() => {
    console.log(transactions)
  }, [transactions])

  const containerAnimationVariants: AnimationProps['variants'] = {
    visible: {
      transition: {
        staggerChildren: 10,
        // staggerChildren: 0.2,
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
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerAnimationVariants}
    >
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.signature + index}
          variants={itemAnimationVariants}
          // onAnimationComplete={(definition) => {
          //   if (definition === 'visible') {
          //     // This will fire when the animation to "visible" completes
          //     console.log('Animation completed - element is now visible')
          //   }
          // }}
        >
          <TransactionsEntry
            transaction={transaction}
            walletAddress={walletAddress}
            displaySwap
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
