'use client'

import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana'
import { NotificationsButton } from '@dialectlabs/react-ui'
import '@dialectlabs/react-ui/index.css'

export const DialectNotificationsComponent = () => {
  const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS
  if (!DAPP_ADDRESS) {
    return null
  }
  return (
    <DialectSolanaSdk dappAddress={DAPP_ADDRESS}>
      <NotificationsButton />
    </DialectSolanaSdk>
  )
}
