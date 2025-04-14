'use client'

import { Button, ButtonSize, ButtonVariant, Spinner } from '@/components/ui'

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
  return (
    <div>
      {!sdkHasLoaded ? (
        <Button
          variant={ButtonVariant.OUTLINE_WHITE}
          className="text-lg capitalize font-bold w-full"
          size={ButtonSize.LG}
        >
          <Spinner />
        </Button>
      ) : !isLoggedIn ? (
        <Button
          variant={ButtonVariant.OUTLINE_WHITE}
          className="text-lg capitalize font-bold w-full"
          size={ButtonSize.LG}
          onClick={() => setShowAuthFlow(true)}
        >
          Connect Wallet
        </Button>
      ) : (
        <Button
          onClick={handleSwap}
          className="text-lg capitalize font-bold w-full"
          size={ButtonSize.LG}
          disabled={loading}
        >
          {loading ? <Spinner /> : <p>Execute Swap</p>}
        </Button>
      )}
    </div>
  )
}
