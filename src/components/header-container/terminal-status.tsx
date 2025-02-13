import { route } from '@/utils/routes'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { TokenBalance } from './token-balance'

interface TerminalStatusProps {
  mainUsername?: string | null
  walletAddress?: string
}

const shortenAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export const TerminalStatus = ({
  mainUsername,
  walletAddress,
}: TerminalStatusProps) => {
  const tokenAddress = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { handleLogOut } = useDynamicContext()

  const t = useTranslations()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogoutClick = async () => {
    try {
      setShowDropdown(false)
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
          <span className="hidden sm:inline uppercase text-[color:var(--text-header)]">
            {t('header.terminal.title')}
          </span>
          <span className="uppercase">${t('header.terminal.sse')}: </span>
          <Link
            href={route('address', { id: tokenAddress })}
            className=" hover:opacity-80 transition-opacity"
            title={tokenAddress}
          >
            <span className="sm:hidden">{shortenAddress(tokenAddress)}</span>
            <span className="hidden sm:inline">{tokenAddress}</span>
          </Link>
          {walletAddress && (
            <span className="/80">
              {' '}
              ({t('header.terminal.balance')}:{' '}
              <TokenBalance walletAddress={walletAddress} />)
            </span>
          )}
        </div>
        {mainUsername && (
          <div className="flex items-center gap-1 relative flex-shrink-0">
            <Link
              href={route('address', { id: mainUsername })}
              className="font-bold  hover:opacity-80 transition-opacity flex-shrink-0"
            >
              {t('header.terminal.user')}: {mainUsername}
            </Link>
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation()
                console.log('Dots clicked, current state:', showDropdown)
                setShowDropdown(!showDropdown)
              }}
              className=" hover: transition-colors px-1 flex-shrink-0 cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
                <div className="w-1 h-1 rounded-full bg-current"></div>
              </div>
            </button>
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="fixed mt-1 text-[10px] min-w-[100px] bg-black border border-green-500/50 py-0.5 z-[9999]"
                style={{
                  top:
                    buttonRef.current?.getBoundingClientRect().bottom ?? 0 + 4,
                  left: buttonRef.current?.getBoundingClientRect().left ?? 0,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLogoutClick()
                  }}
                  className="uppercase w-full px-2 py-1 text-left  hover:bg-green-900/30 transition-colors whitespace-nowrap"
                >
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
