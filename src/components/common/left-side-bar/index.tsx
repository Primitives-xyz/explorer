'use client'

import Image from 'next/image'
import Link from 'next/link'

import { EllipsisVertical, Loader2, Lock, MessageCircle } from 'lucide-react'

import { LanguageSwitcher } from '@/components-new-version/common/language-switcher'
import { Menu } from '@/components/common/left-side-bar/menu'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useTokenBalance } from '@/hooks/use-token-balance'
import { SSE_MINT } from '@/components/trading/constants'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components-new-version/ui'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'

export function LeftSideMenu() {
  const { walletAddress } = useCurrentWallet()
  const t = useTranslations()
  const {
    balance: sseBalance,
    loading: sseBalanceLoading,
  } = useTokenBalance(walletAddress, SSE_MINT)
  const { handleLogOut } = useDynamicContext()

  const handleLogoutClick = async () => {
    try {
      await handleLogOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className='h-[calc(100vh-50px)] w-[400px] flex flex-col justify-between border border-white/20'>
      <div className='h-full flex flex-col justify-between overflow-y-auto'>
        <div className="h-[calc(100%-50px)] min-h-[750px] flex flex-col justify-between p-[32px]">
          <div className='flex flex-col gap-6'>
            <div className="flex flex-row justify-center items-center gap-2">
              <Image
                src="/images/sonala-social-explorer-icon.svg"
                width={30}
                height={30}
                alt="icon"
              />
              <p className="font-mono font-bold text-[20px] text-[#97EF83] leading-[150%] hidden md:block">
                solana_social_explorer
              </p>
            </div>
            <div className="flex flex-row justify-between">
              <div className='flex flex-row gap-2'>
                <Image
                  src="/images/sse.png"
                  alt="sse logo"
                  width={24}
                  height={24}
                  className='rounded-full'
                />
                <div className='flex flex-row items-center gap-1 font-bold text-[#97EF83]'>
                  <p>Balance:</p>
                  {
                    sseBalanceLoading ? (
                      <Loader2 className='w-5 h-5 animate-spin' />
                    ) : (
                      <span>
                        {walletAddress ? sseBalance : 0}
                      </span>
                    )
                  }
                  <span>$SSE</span>
                </div>
              </div>
              {walletAddress && (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <EllipsisVertical className="w-4 h-4 text-[#97EF83]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-black/20 border border-green-800/30 rounded-sm text-[10px] p-0">
                    <DropdownMenuItem onClick={handleLogoutClick} className="font-bold text-white text-[10px] px-6 py-1.5 hover:opacity-80">
                      {t('header.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <Menu />
          </div>
          <div className='flex flex-col gap-4'>
            <div className='w-full flex flex-col justify-center items-center gap-4'>
              <div className='w-full flex flex-row justify-center items-center gap-2 border border-[#97EF83] rounded-[6px] px-4 py-2 text-[#97EF83] hover:bg-[#97EF83] hover:text-[#292C31] cursor-pointer'>
                <Lock />
                <p className='text-[14px] font-bold leading-[150%] caption-bottom'>Unlock Perpetuals</p>
              </div>
              <LanguageSwitcher />
              <Link href="https://1uuq2fsw8t6.typeform.com/to/fEZkbImr" className='w-full'>
                <div className='flex flex-row justify-center items-center gap-2 border border-[#F5F8FD] rounded-[6px] px-4 py-2 text-[#F5F8FD] hover:bg-[#97EF83] hover:text-[#292C31] cursor-pointer'>
                  <MessageCircle />
                  <p className='text-[14px] font-bold leading-[150%] caption-bottom'>Give Feedback</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-full border-t border-white/20 py-2 text-[20px]">
          <div className="flex justify-center items-center text-gray-400">
            <Link
              href="https://cdn.sse.gg/legal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#97EF83] font-bold transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
