import React from 'react'
import { SystemStatus } from './SystemStatus'

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-[100dvh] w-[100dvw] overflow-x-hidden  flex flex-col">
    <div className="flex-grow p-4 w-full overflow-x-hidden">
      <div className="max-w-8xl mx-auto w-full">{children}</div>
    </div>
    <SystemStatus />
  </main>
)
