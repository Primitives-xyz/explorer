import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-lg w-full mx-4">
        <div
          className="bg-black/90 border border-green-800 rounded-lg p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-green-600 hover:text-green-400 font-mono text-sm"
          >
            <X size={20} />
          </button>
          {title && (
            <h2 className="text-xl text-green-400 mb-4 font-bold">{title}</h2>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
