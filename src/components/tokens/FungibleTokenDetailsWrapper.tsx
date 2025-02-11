'use client'

import { usePeopleInCommon } from '@/hooks/use-people-in-common'
import type { FungibleTokenDetailsProps } from '@/utils/helius/types'
import FungibleTokenDetails from '../FungibleTokenDetails'

export function FungibleTokenDetailsWrapper({
  id,
  tokenInfo,
}: FungibleTokenDetailsProps) {
  // Fetch people in common data
  const { topUsers, totalAmount, isLoading } = usePeopleInCommon(id)

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
