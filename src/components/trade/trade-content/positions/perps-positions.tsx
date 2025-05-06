'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from '@/components/ui'
import { useState } from 'react'
import { useDriftUsers } from '../../hooks/drift/use-drift-users'
import { useLimitOrders } from '../../hooks/drift/use-limit-orders'
import { useOpenPositions } from '../../hooks/drift/use-open-positions'
import { FilterPerpsPositions, Tabs } from './filter-perps-positions'
import OrdersTabContent from './orders-tab-content'
import PositionTabContent from './position-tab-content'

export function PerpsPositions() {
  const [selectedType, setSelectedType] = useState(Tabs.PERPS_POSITIONS)
  const { accountIds } = useDriftUsers()
  const {
    perpsPositionsInfo,
    loading: positionsLoading,
    closePosition,
    refreshFetchOpenPositions,
  } = useOpenPositions({
    subAccountId: accountIds[0] || 0,
  })

  const {
    limitOrders,
    cancelLoading,
    loading: ordersLoading,
    cancelOrder,
  } = useLimitOrders({
    subAccountId: accountIds[0] || 0,
  })

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
          <PositionTabContent
            perpsPositionsInfo={perpsPositionsInfo}
            positionsLoading={positionsLoading}
            closePosition={closePosition}
            refreshFetchOpenPositions={refreshFetchOpenPositions}
          />
        )}
        {selectedType === Tabs.PERPS_ORDERS && (
          <OrdersTabContent
            subAccountId={accountIds[0] || 0}
            limitOrders={limitOrders}
            ordersLoading={ordersLoading}
            cancelOrder={cancelOrder}
            cancelLoading={cancelLoading}
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
