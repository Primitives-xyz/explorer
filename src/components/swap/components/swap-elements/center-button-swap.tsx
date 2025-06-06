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
  // Price display props
  outputTokenSymbol?: string
  outputTokenUsdPrice?: number
  solPrice?: number
  showPriceDisplay?: boolean
  onCurrencyToggle?: () => void
  displayCurrency?: 'SOL' | 'USD'
}

export function CenterButtonSwap({
  sdkHasLoaded,
  loading,
  isLoggedIn,
  buttonText,
  notReady = false,
  setShowAuthFlow,
  handleSwap,
  outputTokenSymbol,
  outputTokenUsdPrice,
  solPrice,
  showPriceDisplay = true,
  onCurrencyToggle,
  displayCurrency = 'USD',
}: Props) {
  const t = useTranslations()

  // Calculate exchange rate
  const getExchangeRate = () => {
    if (!outputTokenSymbol || !outputTokenUsdPrice) return null

    if (displayCurrency === 'USD') {
      return {
        rate: outputTokenUsdPrice,
        currency: 'USD',
        symbol: '$',
      }
    } else {
      if (!solPrice) return null
      return {
        rate: outputTokenUsdPrice / solPrice,
        currency: 'SOL',
        symbol: '',
      }
    }
  }

  const exchangeRate = getExchangeRate()

  return (
    <div className="w-full space-y-2">
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

      {/* Exchange Rate Display */}
      {showPriceDisplay && exchangeRate && isLoggedIn && sdkHasLoaded && (
        <div className="flex justify-center">
          <div className="text-xs text-muted-foreground/80 flex items-center gap-1">
            <span>1 {outputTokenSymbol} =</span>
            <span className="font-medium">
              {exchangeRate.symbol}
              {exchangeRate.rate.toLocaleString(undefined, {
                maximumFractionDigits: exchangeRate.currency === 'USD' ? 6 : 8,
                minimumFractionDigits: exchangeRate.currency === 'USD' ? 2 : 4,
              })}
            </span>
            <button
              onClick={onCurrencyToggle}
              className="text-primary/80 hover:text-primary font-medium underline decoration-dotted underline-offset-2 transition-colors"
              disabled={!onCurrencyToggle}
            >
              {exchangeRate.currency}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
