'use client'

import { Button, ButtonVariant, Spinner } from '@/components/ui'

interface Props {
  sdkHasLoaded: boolean
  isLoggedIn: boolean
  accountIds: number[]
  loading: boolean
  selectedDirection: string
  amount: string
  symbol: string
  setShowAuthFlow: (show: boolean) => void
  placePerpsOrder: () => void
}

export function ButtonMiddlePerpetual({
  sdkHasLoaded,
  isLoggedIn,
  accountIds,
  loading,
  selectedDirection,
  amount,
  symbol,
  setShowAuthFlow,
  placePerpsOrder,
}: Props) {
  return (
    <div>
      {(() => {
        if (!sdkHasLoaded) {
          return (
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              className="capitalize font-bold w-full text-lg"
            >
              <Spinner />
            </Button>
          )
        }

        if (!isLoggedIn) {
          return (
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              className="capitalize font-bold w-full text-lg"
              onClick={() => setShowAuthFlow(true)}
            >
              Connect Wallet
            </Button>
          )
        }

        if (!accountIds.length) {
          return (
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              className="capitalize font-bold w-full text-lg"
            >
              No Drift Account
            </Button>
          )
        }

        return (
          <Button
            onClick={() => placePerpsOrder()}
            className="capitalize font-bold w-full text-lg"
            disabled={loading || Number(amount) <= 0}
          >
            {loading ? (
              <Spinner />
            ) : Number(amount) > 0 ? (
              <p>
                {selectedDirection} ~{amount} {symbol}-Perp
              </p>
            ) : (
              <p>Enter an amount</p>
            )}
          </Button>
        )
      })()}
    </div>
  )
}
