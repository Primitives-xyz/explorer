'use client'

import { Button, ButtonVariant, Spinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface Props {
  accountIds: number[]
  loading: boolean
  selectedDirection: string
  amount: string
  symbol: string
  isError: boolean
  placePerpsOrder: () => void
  setIsFundsModalOpen: (val: boolean) => void
}

export function PlacePerpsOrder({
  accountIds,
  symbol,
  loading,
  amount,
  selectedDirection,
  isError,
  setIsFundsModalOpen,
  placePerpsOrder
}: Props) {
  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow } = useCurrentWallet()

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
              onClick={() => setIsFundsModalOpen(true)}
            >
              Unlock Perpetuals
            </Button>
          )
        }

        return (
          <Button
            onClick={() => placePerpsOrder()}
            className="capitalize font-bold w-full text-lg"
            disabled={loading || Number(amount) <= 0 || isError}
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
