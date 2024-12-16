'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { Button } from '@/components/common/button'
import { abbreviateWalletAddress } from '@/components/common/tools'
import { UnifiedWalletButton } from '@jup-ag/wallet-adapter'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  const { walletAddress, mainUsername, walletDisconnect } = useCurrentWallet()

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  return (
    <div className="flex justify-between w-full mb-12 h-[60px]">
      <h1 className="text-4xl">
        <Link href="/" className="hover:opacity-80">
          Tapestry Boilerplate
        </Link>
      </h1>
      <div>
        {mainUsername && walletAddress ? (
          <div className="flex items-center">
            <div className="flex flex-col space-y-1 w-[100px]">
              <Link href={`/${mainUsername}`}>
                <p className="truncate font-bold">{mainUsername}</p>
              </Link>
              <p
                className="text-xs cursor-pointer flex items-center space-x-2 hover:text-gray-500"
                onClick={() => handleCopy(walletAddress)}
              >
                <span>
                  {abbreviateWalletAddress({ address: walletAddress })}
                </span>
              </p>
            </div>
            <Button onClick={walletDisconnect}>
              <LogOut size={20} />
            </Button>
          </div>
        ) : (
          <UnifiedWalletButton />
        )}
      </div>
    </div>
  )
}
