'use client'

import { useState } from "react"

export default function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block z-50">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className="inline-block">
        {children}
      </div>

      <div
        className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
          px-2 py-1 bg-black text-primary text-xs rounded whitespace-nowrap 
          transition-all duration-150 z-10 pointer-events-none
          ${isVisible ? "opacity-100 translate-y-1/2" : "opacity-0 translate-y-1 invisible"}
        `}
      >
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
      </div>
    </div>
  )
}