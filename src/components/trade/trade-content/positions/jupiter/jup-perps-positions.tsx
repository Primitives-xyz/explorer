import { Spinner } from '@/components/ui/spinner'

import { useJupOpenOrders } from '@/components/trade/hooks/jup-perps/use-open-orders'
import { useJupPerpsPositions } from '@/components/trade/hooks/jup-perps/use-positions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { FilterPerpsPositions, Tabs } from '../filter-perps-positions'
import JupOrdersTabContent from './jup-orders-tab-content'
import JupPositionTabContent from './jup-position-tab-content'

export function JupPerpsPositions() {
  const [selectedType, setSelectedType] = useState(Tabs.PERPS_POSITIONS)
  const { positions: perpsPositionsInfo, isLoading: positionsLoading } =
    useJupPerpsPositions()
  const { openOrders: limitOrders, isLoading: ordersLoading } =
    useJupOpenOrders()

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

      <CardContent className="pt-0">
        {selectedType === Tabs.PERPS_POSITIONS && (
          <JupPositionTabContent
            perpsPositionsInfo={perpsPositionsInfo}
            positionsLoading={positionsLoading}
          />
        )}
        {selectedType === Tabs.PERPS_ORDERS && (
          <JupOrdersTabContent
            limitOrders={limitOrders}
            ordersLoading={ordersLoading}
          />
        )}
        <div className="h-6">
          {selectedType === Tabs.PERPS_POSITIONS && positionsLoading && (
            <div className="flex items-center gap-2">
              <p>Loading Positions</p>
              <Spinner size={16} />
            </div>
          )}
          {selectedType === Tabs.PERPS_ORDERS && ordersLoading && (
            <div className="flex items-center gap-2">
              <p>Loading Limit Orders</p>
              <Spinner size={16} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
