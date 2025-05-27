'use client'

import { Button, ButtonVariant, Card, CardContent } from '@/components/ui'
import { useState } from 'react'
import { DriftPerps } from './drift-perps/drift-perps'
import { JupiterPerps } from './jup-perps/jupiter-perps'
import { PerpsType, useTrade } from '../../context/trade-context'

export function Perpetual() {
  const { selectedPerpsType, setSelectedPerpsType } = useTrade()

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid grid-cols-2 gap-2 p-4">
          <Button
            variant={
              selectedPerpsType === PerpsType.DRIFT
                ? ButtonVariant.DEFAULT
                : ButtonVariant.GHOST
            }
            onClick={() => setSelectedPerpsType(PerpsType.DRIFT)}
          >
            Drift Perps
          </Button>

          <Button
            variant={
              selectedPerpsType === PerpsType.JUPITER
                ? ButtonVariant.DEFAULT
                : ButtonVariant.GHOST
            }
            onClick={() => setSelectedPerpsType(PerpsType.JUPITER)}
          >
            Jupiter Perps
          </Button>
        </CardContent>
      </Card>
      {selectedPerpsType === PerpsType.DRIFT && <DriftPerps />}
      {selectedPerpsType === PerpsType.JUPITER && <JupiterPerps />}
    </div>
  )
}
