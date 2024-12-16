import React from 'react'

export const Layout = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-screen bg-black text-green-400 font-mono p-4">
    <div className="max-w-6xl mx-auto">{children}</div>
  </main>
)
