'use client'

import { createContext, useContext, ReactNode, useState } from 'react'

// Predefined highlight colors
export const HIGHLIGHT_COLORS = [
  '#FF5757', // Red
  '#FFB443', // Orange
  '#FFDE59', // Yellow
  '#70FF66', // Green
  '#5CE1E6', // Blue
  '#C270FF', // Purple
]

// Interface for our context
interface AddressHighlightContextType {
  highlightedAddresses: Record<string, string>; // address -> color
  highlightAddress: (address: string, color: string) => void;
  removeHighlight: (address: string) => void;
  clearAllHighlights: () => void;
  getHighlightColor: (address: string) => string | null;
  isAddressHighlighted: (address: string) => boolean;
}

// Create context with default values
const AddressHighlightContext = createContext<AddressHighlightContextType>({
  highlightedAddresses: {},
  highlightAddress: () => {},
  removeHighlight: () => {},
  clearAllHighlights: () => {},
  getHighlightColor: () => null,
  isAddressHighlighted: () => false,
})

// Provider component
export function AddressHighlightProvider({ children }: { children: ReactNode }) {
  const [highlightedAddresses, setHighlightedAddresses] = useState<Record<string, string>>({})
  
  // Highlight an address with a specific color
  const highlightAddress = (address: string, color: string) => {
    setHighlightedAddresses(prev => ({
      ...prev,
      [address]: color
    }))
  }
  
  // Remove highlight from an address
  const removeHighlight = (address: string) => {
    setHighlightedAddresses(prev => {
      const newHighlights = { ...prev }
      delete newHighlights[address]
      return newHighlights
    })
  }
  
  // Clear all highlights
  const clearAllHighlights = () => {
    setHighlightedAddresses({})
  }
  
  // Get the highlight color for an address if it exists
  const getHighlightColor = (address: string): string | null => {
    return highlightedAddresses[address] || null
  }
  
  // Check if an address is highlighted
  const isAddressHighlighted = (address: string): boolean => {
    return !!highlightedAddresses[address]
  }
  
  return (
    <AddressHighlightContext.Provider
      value={{
        highlightedAddresses,
        highlightAddress,
        removeHighlight,
        clearAllHighlights,
        getHighlightColor,
        isAddressHighlighted,
      }}
    >
      {children}
    </AddressHighlightContext.Provider>
  )
}

// Hook to use the context
export function useAddressHighlight() {
  const context = useContext(AddressHighlightContext)
  if (!context) {
    throw new Error('useAddressHighlight must be used within an AddressHighlightProvider')
  }
  return context
} 