import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  InventoryPosition,
  InventoryTransaction,
} from '../types/inventory-types'

interface InventoryStore {
  positions: Record<string, InventoryPosition> // keyed by mint

  // Actions
  addTransaction: (
    mint: string,
    transaction: Omit<InventoryTransaction, 'id'>,
    tokenInfo: {
      symbol: string
      name: string
      image?: string
      currentPrice: number
    }
  ) => void

  updatePrice: (mint: string, newPrice: number) => void
  updatePrices: (prices: Record<string, number>) => void

  removePosition: (mint: string) => void
  clearAllPositions: () => void

  // Getters
  getPosition: (mint: string) => InventoryPosition | undefined
  getAllPositions: () => InventoryPosition[]
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      positions: {},

      addTransaction: (mint, transaction, tokenInfo) => {
        set((state) => {
          const existingPosition = state.positions[mint]
          const newTransaction: InventoryTransaction = {
            ...transaction,
            id: `${Date.now()}-${Math.random()}`,
          }

          if (!existingPosition) {
            // Create new position
            const newPosition: InventoryPosition = {
              mint,
              symbol: tokenInfo.symbol,
              name: tokenInfo.name,
              image: tokenInfo.image,
              averageBuyPrice: transaction.price,
              totalAmount:
                transaction.type === 'buy'
                  ? transaction.amount
                  : -transaction.amount,
              totalInvested:
                transaction.type === 'buy'
                  ? transaction.totalValue
                  : -transaction.totalValue,
              currentPrice: tokenInfo.currentPrice,
              transactions: [newTransaction],
              lastUpdated: Date.now(),
            }

            return {
              positions: {
                ...state.positions,
                [mint]: newPosition,
              },
            }
          }

          // Update existing position
          const updatedTransactions = [
            ...existingPosition.transactions,
            newTransaction,
          ]
          let totalAmount = 0
          let totalInvested = 0

          // Recalculate totals
          updatedTransactions.forEach((tx) => {
            if (tx.type === 'buy') {
              totalAmount += tx.amount
              totalInvested += tx.totalValue
            } else {
              totalAmount -= tx.amount
              totalInvested -= tx.totalValue
            }
          })

          // If position is closed (sold all), remove it
          if (totalAmount <= 0) {
            const { [mint]: _, ...remainingPositions } = state.positions
            return { positions: remainingPositions }
          }

          const averageBuyPrice = totalInvested / totalAmount

          const updatedPosition: InventoryPosition = {
            ...existingPosition,
            averageBuyPrice,
            totalAmount,
            totalInvested,
            currentPrice: tokenInfo.currentPrice,
            transactions: updatedTransactions,
            lastUpdated: Date.now(),
          }

          return {
            positions: {
              ...state.positions,
              [mint]: updatedPosition,
            },
          }
        })
      },

      updatePrice: (mint, newPrice) => {
        set((state) => {
          const position = state.positions[mint]
          if (!position) return state

          return {
            positions: {
              ...state.positions,
              [mint]: {
                ...position,
                currentPrice: newPrice,
                lastUpdated: Date.now(),
              },
            },
          }
        })
      },

      updatePrices: (prices) => {
        set((state) => {
          const updatedPositions = { ...state.positions }

          Object.entries(prices).forEach(([mint, price]) => {
            if (updatedPositions[mint]) {
              updatedPositions[mint] = {
                ...updatedPositions[mint],
                currentPrice: price,
                lastUpdated: Date.now(),
              }
            }
          })

          return { positions: updatedPositions }
        })
      },

      removePosition: (mint) => {
        set((state) => {
          const { [mint]: _, ...remainingPositions } = state.positions
          return { positions: remainingPositions }
        })
      },

      clearAllPositions: () => {
        set({ positions: {} })
      },

      getPosition: (mint) => {
        return get().positions[mint]
      },

      getAllPositions: () => {
        return Object.values(get().positions)
      },
    }),
    {
      name: 'trenches-inventory',
      version: 1,
    }
  )
)
