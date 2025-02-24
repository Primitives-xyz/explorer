import { useWallet } from '@jup-ag/wallet-adapter'
import { useOnWalletChange } from '../connected-wallets/hooks/use-on-wallet-change'

export function OnWalletChangeDisconnect() {
  const { disconnect } = useWallet()

  useOnWalletChange({
    onWalletChange: (walletAddress: string) => {
      console.log('On wallet change:', walletAddress)

      disconnect()
    },
  })

  return null
}
