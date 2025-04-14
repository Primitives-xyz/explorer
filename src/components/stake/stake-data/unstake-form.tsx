import { Button, ButtonVariant, Spinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useUnstake } from '../hooks/use-unstake'

export function UnstakeForm() {
  const t = useTranslations()
  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow } = useCurrentWallet()

  const { unstake, isLoading: showUnstakeLoading } = useUnstake()

  if (!sdkHasLoaded) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Spinner />
        <p>{t('trade.checking_wallet_status')}</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <Button
        variant={ButtonVariant.OUTLINE}
        className="w-full"
        onClick={() => setShowAuthFlow(true)}
      >
        {t('common.connect_wallet')}
      </Button>
    )
  }

  return (
    <>
      {!sdkHasLoaded ? (
        <Button variant={ButtonVariant.OUTLINE} className="mt-4 w-full">
          <Spinner />
          <p>{t('trade.checking_wallet_status')}</p>
        </Button>
      ) : !isLoggedIn ? (
        <Button
          variant={ButtonVariant.OUTLINE}
          className="mt-4 w-full"
          onClick={() => setShowAuthFlow(true)}
        >
          {t('common.connect_wallet')}
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={showUnstakeLoading}
          onClick={unstake}
        >
          {showUnstakeLoading ? (
            <Spinner />
          ) : (
            t('trade.unstake_and_claim_rewards')
          )}
        </Button>
      )}
    </>
  )
}
