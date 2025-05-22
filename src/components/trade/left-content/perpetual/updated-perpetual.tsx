'use client'

import { useState } from "react"
import { DriftPerps } from "./drift-perps/drift-perps"
import { Button, ButtonVariant, Card, CardContent } from "@/components/ui"
import { JupiterPerps } from "./jup-perps/jupiter-perps"

interface Props {
  setTokenMint?: (value: string) => void
}

export function Perpetual({ setTokenMint }: Props) {
  const [selectedPerp, setSelectedPerp] = useState<string>('drift')

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className='grid grid-cols-2 gap-2 p-4'>
          <Button
            variant={selectedPerp === 'drift' ? ButtonVariant.DEFAULT : ButtonVariant.GHOST}
            onClick={() => setSelectedPerp('drift')}
          >
            Drift Perps
          </Button>

          <Button
            variant={selectedPerp === 'jupiter' ? ButtonVariant.DEFAULT : ButtonVariant.GHOST}
            onClick={() => setSelectedPerp('jupiter')}
          >
            Jupiter Perps
          </Button>
        </CardContent>
      </Card>
      {selectedPerp === 'drift' && <DriftPerps setTokenMint={setTokenMint} />}
      {selectedPerp === 'jupiter' && <JupiterPerps setTokenMint={setTokenMint} />}
    </div>
  )
}
