'use client'
import { Button, ButtonSize, ButtonVariant, Spinner } from '@/components/ui'
import { useTranslations } from 'next-intl'

interface Props {
  sdkHasLoaded: boolean
  loading: boolean
  isLoggedIn: boolean
  buttonText: string
  notReady?: boolean
  setShowAuthFlow: (show: boolean) => void
  handleSwap: () => void
}

export function CenterButtonSwap({
  sdkHasLoaded,
  loading,
  isLoggedIn,
  buttonText,
  notReady = false,
  setShowAuthFlow,
  handleSwap,
}: Props) {
  const t = useTranslations()

  return (
    <div className="w-full">
      {!sdkHasLoaded ? (
        <Button
          variant={ButtonVariant.OUTLINE_WHITE}
          className="text-lg capitalize font-bold w-full"
        >
          <Spinner />
        </Button>
      ) : !isLoggedIn ? (
        <Button
          variant={ButtonVariant.OUTLINE_WHITE}
          className="text-lg capitalize font-bold w-full"
          onClick={() => setShowAuthFlow(true)}
        >
          {t('common.connect_wallet')}
        </Button>
      ) : (
        <Button
          onClick={handleSwap}
          size={ButtonSize.LG}
          disabled={loading}
          className={[
            'w-full',
            notReady && !loading ? 'opacity-60 pointer-events-auto' : '',
          ].join(' ')}
        >
          {loading ? <Spinner /> : buttonText}
        </Button>
      )}
    </div>
  )
}
