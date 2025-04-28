import { create } from 'zustand'

interface State {
  enableMotion: boolean
  setEnableMotion: (enable: boolean) => void
}

export const useMotionStore = create<State>()((set) => ({
  enableMotion: false,
  setEnableMotion: (enableMotion) =>
    set(() => ({
      enableMotion,
    })),
}))
