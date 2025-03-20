import Image from 'next/image'
import Link from 'next/link'

import { Lock, MessageCircle } from 'lucide-react'

import { LanguageSwitcher } from '@/components-new-version/common/language-switcher'
import { Menu } from '@/components-new-version/common/left-side-menu/menu'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { TokenBalance } from '@/components/header-container/token-balance'
import { useTranslations } from 'next-intl'

export function LeftSideMenu() {
  const t = useTranslations()
  const { walletAddress } = useCurrentWallet()
  return (
    <div className="flex flex-col p-[32px] w-[340px] gap-[60px]">
      <div className='flex flex-col gap-6'>
        <div className="flex items-center gap-2">
          <Image
            src="/images/sonala-social-explorer-icon.svg"
            width={30}
            height={30}
            alt="icon"
          />
          <p className="font-mono font-bold text-[20px] text-[#97EF83] leading-[150%]">
            solana_social_explorer
          </p>
        </div>
        {walletAddress && (
          <div className="/80">dsfdf
            ({t('header.terminal.balance')}:{' '}
            <TokenBalance walletAddress={walletAddress} />)
          </div>
        )}
        <div>klklklkl</div>
        {/* <Menu /> */}
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
  )
}
