import { useBirdeyeTokenOverview } from '@/components/trade/hooks/use-birdeye-token-overview'
import {
  FilterTabsTokenDetails,
  FilterTabsYourTransactions,
  FilterTokenDetails,
  TabsTokenDetails,
} from '@/components/trade/trade-content/filter-token-details'
import { AboutTabContent } from '@/components/trade/trade-content/token-details/about-tab-content'
import { MarketsTabContent } from '@/components/trade/trade-content/token-details/markets-tab-content'
import { TokenHoldersTabContent } from '@/components/trade/trade-content/token-details/token-holders-tab-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useEffect, useState } from 'react'
import { YourTransactions } from '../transactions/your-transactions'

interface TokenDetailsProps {
  id: string
}

export function TokenDetails({ id }: TokenDetailsProps) {
  const { walletAddress, setShowAuthFlow } = useCurrentWallet()
  const { overview } = useBirdeyeTokenOverview(id)
  const [selectedType, setSelectedType] = useState(
    TabsTokenDetails.TOKEN_DETAILS
  )
  const [sort, setSort] = useState<
    FilterTabsTokenDetails | FilterTabsYourTransactions
  >(FilterTabsTokenDetails.ABOUT)

  useEffect(() => {
    if (selectedType === TabsTokenDetails.TOKEN_DETAILS) {
      setSort(FilterTabsTokenDetails.ABOUT)
    } else {
      setSort(FilterTabsYourTransactions.ALL)
    }
  }, [selectedType])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FilterTokenDetails
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            sort={sort}
            setSort={setSort}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedType === TabsTokenDetails.TOKEN_DETAILS && (
          <>
            {FilterTabsTokenDetails.ABOUT === sort && (
              <AboutTabContent id={id} overview={overview} />
            )}

            {FilterTabsTokenDetails.TOKEN_HOLDERS === sort && (
              <TokenHoldersTabContent id={id} overview={overview} />
            )}

            {FilterTabsTokenDetails.MARKETS === sort && <MarketsTabContent />}
          </>
        )}
        {selectedType === TabsTokenDetails.YOUR_TRANSACTIONS && (
          <YourTransactions
            id={id}
            walletAddress={walletAddress}
            sort={sort as FilterTabsYourTransactions}
            setShowAuthFlow={setShowAuthFlow}
          />
        )}
      </CardContent>
    </Card>
  )
}
