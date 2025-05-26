import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EPudgyTheme } from '../pudgy.models'

interface State {
  theme?: EPudgyTheme
  setTheme: (theme: EPudgyTheme) => void
}

export const usePudgyStore = create(
  persist<State>(
    (set) => ({
      theme: EPudgyTheme.DEFAULT,
      setTheme: (theme) =>
        set(() => ({
          theme,
        })),
    }),
    {
      name: 'pudgy-store',
    }
  )
)
