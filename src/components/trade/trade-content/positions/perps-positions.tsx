import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useState } from 'react'
import { useDriftUsers } from '../../hooks/drift/use-drift-users'
import { FilterPerpsPositions, Tabs } from './filter-perps-positions'
import OrdersTabContent from './orders-tab-content'
import PositionTabContent from './position-tab-content'

export function PerpsPositions() {
  const [selectedType, setSelectedType] = useState(Tabs.PERPS_POSITIONS)
  const { accountIds } = useDriftUsers()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FilterPerpsPositions
            selectedType={selectedType}
            setSelectedType={setSelectedType}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedType === Tabs.PERPS_POSITIONS && (
          <PositionTabContent subAccountId={accountIds[0] || 0} />
        )}
        {selectedType === Tabs.PERPS_ORDERS && (
          <OrdersTabContent subAccountId={accountIds[0] || 0} />
        )}
      </CardContent>
    </Card>
  )
}
