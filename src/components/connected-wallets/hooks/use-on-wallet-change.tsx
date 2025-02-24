import { useEffect } from 'react'

interface Props {
  onWalletChange: (walletAddress: string) => void
}

export function useOnWalletChange({ onWalletChange }: Props) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const provider = (window as any).solana

    if (provider) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const handleAccountChange = async (newPublicKey: any) => {
        if (newPublicKey) {
          const walletAddress = newPublicKey?.toBase58()

          onWalletChange(walletAddress)
        }
      }

      provider.on('accountChanged', handleAccountChange)

      return () => {
        provider.removeListener('accountChanged', handleAccountChange)
      }
    }
  }, [onWalletChange])

  return null
}
