import { create } from 'zustand'

interface State {
  open: boolean
  setOpen: (open: boolean) => void
}

export const useSwapStore = create<State>()((set) => ({
  open: false,
  setOpen: (open) =>
    set(() => ({
      open,
    })),
}))
