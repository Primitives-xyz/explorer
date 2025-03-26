'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { ArrowRightLeft, EllipsisVertical, Info, Loader2, Lock, LogOut, MessageCircle } from 'lucide-react'

import { LanguageSwitcher } from '@/components-new-version/common/language-switcher'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useTokenBalance } from '@/hooks/use-token-balance'
import { SSE_MINT } from '@/components/trading/constants'
import { Menu } from './menu'
import AddFundsModal from './add-funds-modal'

export function LeftSideMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { walletAddress } = useCurrentWallet()
  const { balance: sseBalance, loading: sseBalanceLoading } = useTokenBalance(walletAddress, SSE_MINT)
  const { handleLogOut } = useDynamicContext()
  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)

  const handleLogoutClick = async () => {
    try {
      await handleLogOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  // Standardized text style classes
  const textStyle = "font-mono text-[#97EF83] leading-150";
  const buttonStyle = "flex flex-row justify-center items-center gap-2 border rounded-[6px] px-4 py-2 transition-colors hover:border-[#97EF83] hover:text-[#97EF83]";

  return (
    <div className='h-[calc(100vh-50px)] w-[400px] flex flex-col'>
      <div className='h-full flex flex-col overflow-y-auto'>
        <div className="h-full min-h-750 flex flex-col justify-between p-8">
          <div className='flex flex-col gap-6'>
            {/* Logo & Title */}
            <div className="flex flex-row justify-center items-center gap-2">
              <Image
                src="/images/sonala-social-explorer-icon.svg"
                width={30}
                height={30}
                alt="SSE Icon"
                priority
              />
              <p className={`${textStyle} font-bold text-lg hidden md:block`}>
                solana_social_explorer
              </p>
            </div>

            {/* Balance Section */}
            <div className="flex flex-row justify-between">
              <div className='flex flex-row gap-2 items-center'>
                <Image
                  src="/images/sse.png"
                  alt="SSE Logo"
                  width={20}
                  height={20}
                  className='rounded-full'
                />
                <div className={`flex flex-row items-center gap-1 ${textStyle} font-bold text-[14px]`}>
                  <p>$SSE Bal:</p>
                  {sseBalanceLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <span>{walletAddress ? sseBalance : 0}</span>
                  )}
                </div>
              </div>

              {walletAddress && (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-green-300 hover:bg-white/10 p-1 rounded-full transition-colors"
                  aria-label="Menu"
                >
                  <EllipsisVertical className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="w-full z-50 transition-all duration-200 text-[#97EF83]">
                <div
                  className="border border-green-300/20 bg-green-300/20 shadow-lg backdrop-blur-lg rounded-[20px]"
                  style={{
                    boxShadow: '0px 0px 4.6px 0px rgba(151, 239, 131, 0.20)'
                  }}
                >
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-green-300/30 transition-colors rounded-[20px]"
                  >
                    <span className={`${textStyle} font-medium text-[16px]`}>Logout</span>
                    <LogOut className="h-5 w-5 text-green-300" />
                  </button>
                </div>
              </div>
            )}

            {/* Main Menu */}
            <Menu />
          </div>

          {/* Footer Section */}
          <div className='flex flex-col gap-10 mt-12'>
            <div className="p-4 border border-[#97EF83] rounded-[12px] bg-white/10 flex flex-col gap-4">
              <div className='flex justify-between items-center'>
                <h3 className="text-[#97EF83] text-[12px] font-medium">Low Fee Trades with SSE</h3>
                <button className="text-gray-300 hover:text-gray-400 transition-colors">
                  <Info size={18} className='text-[#97EF83]' />
                </button>
              </div>

              <p className='text-[12px] font-normal leading-normal text-white/70'>
                SSE offers the cheapest fee across all current platforms.
              </p>

              <Link
                href="/trade"
                className="w-full flex justify-center items-center px-4 py-1 bg-[#97EF83] rounded-[6px] text-[#292C31] font-bold leading-[150%] hover:bg-[#64e947]"
              >
                <ArrowRightLeft size={20} />
                <span>Trade</span>
              </Link>
            </div>
            <div className='w-full flex flex-col justify-center items-center gap-4'>
              <button className={`${buttonStyle} w-full`} onClick={() => setIsFundsModalOpen(true)}>
                <Lock />
                <span className="font-mono leading-150 text-[14px] font-bold">Unlock Perpetuals</span>
              </button>

              <LanguageSwitcher />

              <Link href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr" className='w-full'>
                <div className={`${buttonStyle} border-white text-white w-full`}>
                  <MessageCircle />
                  <span className="font-mono leading-150 text-[14px] font-bold">Give Feedback</span>
                </div>
              </Link>
            </div>
          </div>
          <AddFundsModal isOpen={isFundsModalOpen} setIsOpen={setIsFundsModalOpen} />
        </div>
      </div>
    </div>
  )
}