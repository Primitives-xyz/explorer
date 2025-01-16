'use client'

import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana'
import { NotificationsButton } from '@dialectlabs/react-ui'
import '@dialectlabs/react-ui/index.css'

const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS || '2dCVckCxPgmTPass9sqYedLi9QNQc7yNuW6rPTU1Su4d'

export const DialectNotifications = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DialectSolanaSdk dappAddress={DAPP_ADDRESS}>
        <NotificationsButton />
      </DialectSolanaSdk>
    </div>
  )
} 