'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Menu, Package, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FloatingActionDockProps {
  showHotFeed: boolean
  onToggleHotFeed: () => void
  onOpenInventory: () => void
  onLaunchToken?: () => void // Future functionality
}

export function FloatingActionDock({
  showHotFeed,
  onToggleHotFeed,
  onOpenInventory,
  onLaunchToken,
}: FloatingActionDockProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Ensure visibility after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const actions = [
    {
      id: 'inventory',
      icon: Package,
      label: 'Portfolio',
      onClick: onOpenInventory,
      className:
        'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
    },
    {
      id: 'hotfeed',
      icon: Flame,
      label: showHotFeed ? 'Close Hot Feed' : 'Hot Feed',
      onClick: onToggleHotFeed,
      className: showHotFeed
        ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
      active: showHotFeed,
    },
    // Future token launching - commented out for now
    // {
    //   id: 'launch',
    //   icon: Plus,
    //   label: 'Launch Token',
    //   onClick: onLaunchToken,
    //   className: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    // },
  ]

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      style={{
        pointerEvents: isVisible ? 'auto' : 'none',
        willChange: 'transform, opacity',
      }}
    >
      {/* Main Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: isExpanded ? 45 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleExpanded}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl flex items-center justify-center border-2 border-white/20 backdrop-blur-sm"
        style={{ filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.5))' }}
        aria-label={isExpanded ? 'Close menu' : 'Open menu'}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <Menu className="w-7 h-7 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 right-0 flex flex-col gap-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  action.onClick?.()
                  setIsExpanded(false)
                }}
                className={`w-14 h-14 rounded-full ${action.className} shadow-lg flex items-center justify-center border border-white/20 backdrop-blur-sm group relative`}
                aria-label={action.label}
              >
                <action.icon
                  className={`w-6 h-6 ${
                    action.active ? 'text-gray-400' : 'text-white'
                  }`}
                />

                {/* Tooltip */}
                <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black/90 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap border border-white/20">
                    {action.label}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-black/90"></div>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
