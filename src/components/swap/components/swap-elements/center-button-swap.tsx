'use client'

import { Glitch } from '@/components/motion/components/glitch'
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
        <Glitch
          options={{
            playMode: 'hover',
            // pulse: {
            //   scale: 2,
            // },
          }}
        >
          <Button
            onClick={handleSwap}
            size={ButtonSize.LG}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Spinner /> : 'Execute Swap'}
          </Button>
        </Glitch>
      )}
    </div>
  )
}
