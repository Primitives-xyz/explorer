import { LanguageSwitcher } from '@/components/header-container/language-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/popover/dropdown-menu'
import { route } from '@/utils/routes'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { EllipsisVertical } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { TokenBalance } from './token-balance'

interface TerminalStatusProps {
  mainUsername?: string | null
  walletAddress?: string
}

const shortenAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function TerminalStatus({
  mainUsername,
  walletAddress,
}: TerminalStatusProps) {
  const tokenAddress = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'
  const { handleLogOut } = useDynamicContext()
  const t = useTranslations()

  const handleLogoutClick = async () => {
    try {
      await handleLogOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  return (
    <div className="w-full bg-black/20 px-3 py-1.5 border border-green-800/30 rounded-sm">
      <div className="flex items-center justify-between text-[10px] /80 whitespace-nowrap">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <div className="w-2 h-2 rounded-full bg-green-500/80 flex-shrink-0"></div>
          <span className="hidden sm:inline uppercase ">
            {t('header.terminal.title')}
          </span>
          <span className="uppercase">${t('header.terminal.sse')}: </span>
          <Link
            href={route('address', { id: tokenAddress })}
            className="hover:opacity-80 transition-opacity"
            title={tokenAddress}
          >
            <span className="sm:hidden">{shortenAddress(tokenAddress)}</span>
            <span className="hidden sm:inline">{tokenAddress}</span>
          </Link>
          {walletAddress && (
            <span className="/80">
              ({t('header.terminal.balance')}:{' '}
              <TokenBalance walletAddress={walletAddress} />)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {mainUsername && (
            <div className="flex items-center gap-1 relative flex-shrink-0">
              <Link
                href={route('address', { id: mainUsername })}
                className="font-bold hover:opacity-80 transition-opacity flex-shrink-0"
              >
                {t('header.terminal.user')}: {mainUsername}
              </Link>
            </div>
          )}
          {walletAddress && (
          <DropdownMenu>
                <DropdownMenuTrigger>
                  <EllipsisVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogoutClick}>
                    {t('header.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
