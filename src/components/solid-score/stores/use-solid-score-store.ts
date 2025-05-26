import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface State {
  openRevealScoreAnimation: boolean
  setOpenRevealScoreAnimation: (openRevealScoreAnimation: boolean) => void
}

export const useSolidScoreStore = create(
  persist<State>(
    (set) => ({
      openRevealScoreAnimation: false,
      setOpenRevealScoreAnimation: (openRevealScoreAnimation) =>
        set(() => ({
          openRevealScoreAnimation,
        })),
    }),
    {
      name: 'solid-score-store',
    }
  )
)
