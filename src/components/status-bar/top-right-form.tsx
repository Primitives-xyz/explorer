'use client'
import React, { useEffect } from 'react'

const styles = `
@keyframes move {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-move {
  animation: move 1.2s steps(8) infinite;
  will-change: transform;
}
`

export function TopRightForm() {
  useEffect(() => {
    // Check if styles are already injected to prevent duplicates
    const existingStyle = document.getElementById('top-right-form-styles')
    if (existingStyle) {
      return
    }

    const styleSheet = document.createElement('style')
    styleSheet.id = 'top-right-form-styles'
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)

    // Cleanup function to remove styles when component unmounts
    return () => {
      const styleToRemove = document.getElementById('top-right-form-styles')
      if (styleToRemove) {
        styleToRemove.remove()
      }
    }
  }, [])

  return (
    <div className="relative w-[calc(8*0.5rem)] md:w-[calc(8*0.75rem)] h-2 bg-background overflow-hidden">
      <div className="absolute flex animate-move">
        {[...Array(2)].map((_, loopIndex) => (
          <React.Fragment key={loopIndex}>
            {[
              { bg: 'bg-background', opacity: '' },
              { bg: 'bg-primary', opacity: '/20' },
              { bg: 'bg-primary', opacity: '/60' },
              { bg: 'bg-primary', opacity: '' },
              { bg: 'bg-primary', opacity: '' },
              { bg: 'bg-primary', opacity: '/60' },
              { bg: 'bg-primary', opacity: '/20' },
              { bg: 'bg-background', opacity: '' },
            ].map((style, index) => (
              <div
                key={`${loopIndex}-${index}`}
                className={`w-2 md:w-3 h-2 ${style.bg}${style.opacity} border-2 border-y-muted border-x-card`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
