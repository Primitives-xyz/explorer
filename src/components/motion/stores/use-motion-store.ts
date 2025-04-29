import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface State {
  enableMotion: boolean
  setEnableMotion: (enable: boolean) => void
}

export const useMotionStore = create(
  persist<State>(
    (set) => ({
      enableMotion: true,
      setEnableMotion: (enableMotion) =>
        set(() => ({
          enableMotion,
        })),
    }),
    {
      name: 'enable-motion',
    }
  )
)
