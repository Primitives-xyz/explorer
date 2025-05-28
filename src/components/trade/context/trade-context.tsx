import { FilterType } from '@/components/trade/left-content/trade-left-content'
import { createContext, ReactNode, useContext, useState } from 'react'

interface TradeContextType {
  tokenMint: string
  setTokenMint: (mint: string) => void
  selectedType: FilterType
  setSelectedType: (type: FilterType) => void
  selectedPerpsType: PerpsType
  setSelectedPerpsType: (type: PerpsType) => void
}

export enum PerpsType {
  DRIFT = 'drift',
  JUPITER = 'jupiter',
}

const TradeContext = createContext<TradeContextType | undefined>(undefined)

export function TradeProvider({ children }: { children: ReactNode }) {
  const [tokenMint, setTokenMint] = useState<string>('')
  const [selectedType, setSelectedType] = useState<FilterType>(FilterType.SWAP)
  const [selectedPerpsType, setSelectedPerpsType] = useState<PerpsType>(
    PerpsType.DRIFT
  )

  return (
    <TradeContext.Provider
      value={{
        tokenMint,
        setTokenMint,
        selectedType,
        setSelectedType,
        selectedPerpsType,
        setSelectedPerpsType,
      }}
    >
      {children}
    </TradeContext.Provider>
  )
}

export function useTrade() {
  const context = useContext(TradeContext)
  if (context === undefined) {
    throw new Error('useTrade must be used within a TradeProvider')
  }
  return context
}
