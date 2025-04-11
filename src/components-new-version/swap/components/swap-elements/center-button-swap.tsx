'use client'

import {
  Button,
  ButtonSize,
  ButtonVariant,
  Spinner,
} from '@/components-new-version/ui'

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
          expand
          variant={ButtonVariant.OUTLINE_WHITE}
          className="text-lg capitalize font-bold"
          size={ButtonSize.LG}
        >
          <Spinner />
        </Button>
      ) : (
        !isLoggedIn ? (
          <Button
            expand
            variant={ButtonVariant.OUTLINE_WHITE}
            className="text-lg capitalize font-bold"
            size={ButtonSize.LG}
            onClick={() => setShowAuthFlow(true)}
          >
            Connect Wallet
          </Button>
        ) : (
          <Button
            expand
            onClick={handleSwap}
            className="text-lg capitalize font-bold"
            size={ButtonSize.LG}
            disabled={loading}
          >
            {loading ? <Spinner /> : <p>Execute Swap</p>}
          </Button>
        )
      )}
    </div>
  )
}
