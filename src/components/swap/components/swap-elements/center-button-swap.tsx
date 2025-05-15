'use client'
import { Button, ButtonSize, ButtonVariant, Spinner } from '@/components/ui'

interface Props {
  sdkHasLoaded: boolean
  loading: boolean
  isLoggedIn: boolean
  setShowAuthFlow: (show: boolean) => void
  handleSwap: () => void
  buttonText?: string
  notReady?: boolean
}

export function CenterButtonSwap({
  sdkHasLoaded,
  loading,
  isLoggedIn,
  setShowAuthFlow,
  handleSwap,
  buttonText = 'Execute Swap',
  notReady = false,
}: Props) {
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
          Connect Wallet
        </Button>
      ) : (
          <Button
            onClick={handleSwap}
            size={ButtonSize.LG}
            disabled={loading}
            className={['w-full', notReady && !loading ? 'opacity-60 pointer-events-auto' : ''].join(' ')}
          >
            {loading ? <Spinner /> : buttonText}
          </Button>
      )}
    </div>
  )
}
