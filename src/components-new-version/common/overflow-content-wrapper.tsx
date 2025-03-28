import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function OverflowContentWrapper({ children }: Props) {
  return (
    <div
      className="h-screen overflow-auto scrollbar-hide relative w-full mx-6"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div className="absolute pt-[100px] w-full pb-[100px] space-y-4">
        {children}
      </div>
    </div>
  )
}
