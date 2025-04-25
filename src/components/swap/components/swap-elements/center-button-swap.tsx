'use client'

import { Button, ButtonSize, ButtonVariant, Spinner } from '@/components/ui'
import { useGlitch } from 'react-powerglitch'

interface Props {
  sdkHasLoaded: boolean
  loading: boolean
  isLoggedIn: boolean
  setShowAuthFlow: (show: boolean) => void
  handleSwap: () => void
}

export function CenterButtonSwap({
  sdkHasLoaded,
  loading,
  isLoggedIn,
  setShowAuthFlow,
  handleSwap,
}: Props) {
  const glitch = useGlitch()

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
        <div ref={glitch.ref} className="w-full">
          <Button
            onClick={handleSwap}
            size={ButtonSize.LG}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Spinner /> : 'Execute Swap'}
          </Button>
        </div>
      )}
    </div>
  )
}
