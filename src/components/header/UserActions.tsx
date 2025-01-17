'use client'

import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'


import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana';
import { NotificationsButton } from '@dialectlabs/react-ui';
import '@dialectlabs/react-ui/index.css';

const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS || '4M2ktdatcMnziGpyvgNqu6hV2utBMKhkKLJfaUumPM9K';

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton,
    ),
  { ssr: false },
)

const WalletConnectButton = (
  <div className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer">
    [CONNECT WALLET]
  </div>
) as React.ReactElement

interface UserActionsProps {
  walletAddress?: string
}

export const UserActions = ({ walletAddress }: UserActionsProps) => {
  const { handleLogOut } = useDynamicContext()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  const handleLogoutClick = async () => {
    try {
      console.log('Logout clicked, attempting to log out...')
      setShowDropdown(false) // Close dropdown immediately
      console.log('Calling handleLogOut from Dynamic...')
      await handleLogOut()
      console.log('Logout successful, redirecting...')
      // Force a page refresh to ensure clean state
      window.location.href = '/'
    } catch (error) {
      console.error('Failed to logout:', error)
      // Optionally show an error message to the user
    }
  }

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <div style={{"position": "relative", "display": "inline-block"}}>
      <DialectSolanaSdk 
        dappAddress={DAPP_ADDRESS}>
          <NotificationsButton 
            theme='dark'
            />
      </DialectSolanaSdk>
        </div>
    <button
        onClick={handleSearchClick}
        className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer flex-shrink-0"
      >
        [SEARCH]
      </button>
      {!walletAddress && (
        <div className="flex-shrink-0">
          <DynamicConnectButton>{WalletConnectButton}</DynamicConnectButton>
        </div>
      )}
      {walletAddress && (
        <>
          <Link
            href={`/${walletAddress}`}
            className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors flex-shrink-0"
          >
            [PORTFOLIO]
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              ref={buttonRef}
              onClick={() => setShowDropdown(!showDropdown)}
              className="px-3 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors flex-shrink-0"
            >
              •••
            </button>
            {showDropdown && buttonRef.current && (
              <div
                style={{
                  position: 'fixed',
                  top: buttonRef.current.getBoundingClientRect().bottom + 2,
                  left: buttonRef.current.getBoundingClientRect().right - 192,
                  zIndex: 99999,
                }}
                className="w-48 rounded-sm border border-green-500/50 bg-black py-1 shadow-lg"
              >
                <button
                  onClick={handleLogoutClick}
                  className="block w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-green-900/30 transition-colors"
                >
                  [LOGOUT]
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
