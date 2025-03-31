import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function SimpleContentWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-screen overflow-auto scrollbar-hide relative w-full mx-6 flex flex-row"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {children}
    </div>
  )
}
