import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { useState } from "react"
import { FilterPerpsPositions, FilterTabsPerpsPositions, Tabs } from "./filter-perps-positions"
import { useDriftUsers } from "../../hooks/drift/use-drift-users"
import PositionTabContent from "./position-tab-content"
import OrdersTabContent from "./orders-tab-content"

export function PerpsPositions() {
  const [selectedType, setSelectedType] = useState(Tabs.PERPS_POSITIONS)
  const [sort, setSort] = useState<FilterTabsPerpsPositions>(FilterTabsPerpsPositions.POSITIONS)
  const { accountIds } = useDriftUsers()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FilterPerpsPositions
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            sort={sort}
            setSort={setSort}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedType === Tabs.PERPS_POSITIONS && (
          <>
            {FilterTabsPerpsPositions.POSITIONS === sort && (
              <PositionTabContent
                subAccountId={accountIds[0] || 0}
              />
            )}

            {FilterTabsPerpsPositions.ORDERS === sort && (
              <OrdersTabContent
                subAccountId={accountIds[0] || 0}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}