import React from 'react'
import { SystemStatus } from './SystemStatus'

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-screen bg-black text-green-400 font-mono flex flex-col">
    <div className="flex-grow p-4">
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
    <SystemStatus />
  </main>
)
