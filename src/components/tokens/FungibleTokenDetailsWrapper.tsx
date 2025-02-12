'use client'

import FungibleTokenDetails from '@/components/fungible-token-details'
import { usePeopleInCommon } from '@/hooks/use-people-in-common'
import type { FungibleTokenDetailsProps } from '@/utils/helius/types'

export function FungibleTokenDetailsWrapper({
  id,
  tokenInfo,
}: FungibleTokenDetailsProps) {
  // Fetch people in common data
  const { topUsers, totalAmount, isLoading, error } = usePeopleInCommon(id)

  // Log any errors that occur during data fetching
  if (error) {
    console.error('Error fetching people in common:', error)
  }

  // Create a modified version of tokenInfo that includes the people in common data
  const enhancedTokenInfo = {
    ...tokenInfo,
    // We'll pass the data through the existing component structure
    // The PeopleInCommonSection inside FungibleTokenDetails will use this data
    peopleInCommon: {
      topUsers,
      totalAmount,
      isLoading,
    },
  }

  return <FungibleTokenDetails id={id} tokenInfo={enhancedTokenInfo} />
}
