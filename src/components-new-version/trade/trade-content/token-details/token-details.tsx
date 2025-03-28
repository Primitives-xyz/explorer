import {
  FilterTabsTokenDetails,
  FilterTokenDetails,
  TabsTokenDetails,
} from '@/components-new-version/trade/trade-content/filter-token-details'
import { AboutTabContent } from '@/components-new-version/trade/trade-content/token-details/about-tab-content'
import { MarketsTabContent } from '@/components-new-version/trade/trade-content/token-details/markets-tab-content'
import { TokenHoldersTabContent } from '@/components-new-version/trade/trade-content/token-details/token-holders-tab-content'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'
import { useState } from 'react'

export function TokenDetails() {
  const [selectedType, setSelectedType] = useState(
    TabsTokenDetails.TOKEN_DETAILS
  )
  const [sort, setSort] = useState(FilterTabsTokenDetails.ABOUT)

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
            {FilterTabsTokenDetails.ABOUT === sort && <AboutTabContent />}

            {FilterTabsTokenDetails.TOKEN_HOLDERS === sort && (
              <TokenHoldersTabContent />
            )}

            {FilterTabsTokenDetails.MARKETS === sort && <MarketsTabContent />}
          </>
        )}
        {selectedType === TabsTokenDetails.YOUR_TRANSACTIONS && (
          <p>transactions</p>
        )}
      </CardContent>
    </Card>
  )
}
