import { useState } from 'react'

export function useOpenSwapHomeContent() {
  const [showSwap, setOpenSwap] = useState(false)

  return {
    showSwap,
    setOpenSwap,
  }
}
