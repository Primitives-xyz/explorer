'use client'

import { route } from '@/utils/routes'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { DialectNotificationsComponent } from '../notifications/dialect-notifications-component'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

interface UserActionsProps {
  walletAddress?: string
}

export const UserActions = ({ walletAddress }: UserActionsProps) => {
  const t = useTranslations()

  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <a
        href="https://flappy.sse.gg"
        target="_blank"
        rel="noopener noreferrer"
        className="uppercase px-4 py-1.5 border border-green-500/50 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors flex-shrink-0"
      >
        {t('header.play')}
      </a>
      <button
        onClick={handleSearchClick}
        className="uppercase px-4 py-1.5 border border-green-500/50  hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer flex-shrink-0"
      >
        {t('header.search')}
      </button>
      <Link
        href={route('trade')}
        className="uppercase px-4 py-1.5 border border-green-500/50  hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors flex-shrink-0"
      >
        {t('header.trade')}
      </Link>
      {!walletAddress && (
        <div className="flex-shrink-0">
          <DynamicConnectButton>
            <div className="uppercase px-4 py-1.5 border border-green-500/50  hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer">
              {t('header.connect_wallet')}
            </div>
          </DynamicConnectButton>
        </div>
      )}
      {walletAddress && (
        <Link
          href={route('address', { id: walletAddress })}
          className="uppercase px-4 py-1.5 border border-green-500/50  hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors flex-shrink-0"
        >
          {t('header.portfolio')}
        </Link>
      )}

      <DialectNotificationsComponent />

      {/* <a
        href={route('graphVisualization')}
        className="uppercase px-4 py-1.5 border border-green-500/50 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer flex-shrink-0"
      >
        {t('header.graph')}
      </a> */}
    </div>
  )
}
