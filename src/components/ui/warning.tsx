import React from 'react'

export default function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-sm">
      {children}
    </div>
  )
} 