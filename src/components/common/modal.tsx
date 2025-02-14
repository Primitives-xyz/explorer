import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
}: ModalProps) {
  const modalRoot = useRef<Element | null>(null)

  useEffect(() => {
    // Find or create modal root
    let element = document.getElementById('modal-root')
    if (!element) {
      element = document.createElement('div')
      element.id = 'modal-root'
      document.body.appendChild(element)
    }
    modalRoot.current = element

    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !modalRoot.current) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg md:max-w-2xl lg:max-w-4xl bg-black/90 border border-green-500/20 rounded-lg shadow-xl',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-green-500/20">
          <h2 className="text-lg md:text-xl font-medium ">{title}</h2>
          <button onClick={onClose} className=" hover: transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>,
    modalRoot.current
  )
}
