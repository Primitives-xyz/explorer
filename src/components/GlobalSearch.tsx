import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import SearchBar from './SearchBar'
import { usePathname } from 'next/navigation'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close modal when pathname changes (navigation occurs)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-16 text-left align-middle transition-all transform">
          <div className="relative">
            <SearchBar autoFocus />
            <div className="absolute top-0 right-0 mt-2 mr-2 text-xs text-green-800 font-mono">
              ESC to close
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
