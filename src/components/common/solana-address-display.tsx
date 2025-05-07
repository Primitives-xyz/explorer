'use client'

import { CopyToClipboardButton } from '@/components/ui'
import { ButtonSize, ButtonVariant } from '@/components/ui/button'
import { isValidSolanaAddress } from '@/utils/validation'
import { abbreviateWalletAddress } from '@/utils/utils'
import { CopyIcon, Check, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/popover/tooltip'
import { cn } from '@/utils/utils'
import { useState, useRef, useEffect } from 'react'
import { HIGHLIGHT_COLORS, useAddressHighlight } from '@/components/common/use-address-highlight'
import { useRouter } from 'next/navigation'
import { route } from '@/utils/route'
import { createPortal } from 'react-dom'

interface SolanaAddressDisplayProps {
  address: string
  displayText?: string
  showCopyButton?: boolean
  showTooltip?: boolean
  className?: string
  fullAddressOnHover?: boolean
  highlightable?: boolean
  displayAbbreviatedAddress?: boolean
}

export function SolanaAddressDisplay({
  address,
  displayText,
  showCopyButton = true,
  showTooltip = true,
  className,
  fullAddressOnHover = true,
  highlightable = false,
  displayAbbreviatedAddress = false,
}: SolanaAddressDisplayProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const containerDivRef = useRef<HTMLDivElement>(null)
  const containerSpanRef = useRef<HTMLSpanElement>(null)
  const addressRef = useRef<HTMLSpanElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<number | null>(null)
  const isValid = isValidSolanaAddress(address)
  const abbreviatedAddress = abbreviateWalletAddress({ address })
  
  // Connect to the highlighting system
  const { 
    highlightAddress, 
    removeHighlight, 
    getHighlightColor, 
    isAddressHighlighted 
  } = useAddressHighlight()
  
  // Get current highlight state
  const highlightColor = getHighlightColor(address)
  const isHighlighted = isAddressHighlighted(address)
  
  const router = useRouter()
  
  // Clear any existing hide timer
  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }
  
  // Handle showing and hiding the color picker
  const showPicker = () => {
    clearHideTimer()
    setShowColorPicker(true)
  }
  
  const hidePicker = () => {
    clearHideTimer()
    hideTimerRef.current = window.setTimeout(() => {
      setShowColorPicker(false)
    }, 100) // Longer delay of 500ms to give user more time
  }
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => clearHideTimer()
  }, [])
  
  // Function to apply highlighting
  const applyHighlight = (color: string) => {
    console.log('Applying highlight:', address, color)
    highlightAddress(address, color)
    setShowColorPicker(false)
  }
  
  // Function to remove highlighting
  const removeHighlighting = () => {
    console.log('Removing highlight:', address)
    removeHighlight(address)
    setShowColorPicker(false)
  }
  
  // Handler for navigation
  const handleAddressClick = (e: React.MouseEvent) => {
    if (!isValid) return
    e.stopPropagation()
    router.push(route('entity', { id: address }))
  }
  
  const displayElement = (
    <span
      ref={addressRef}
      className={cn(
        "font-mono transition-colors duration-200 relative",
        "cursor-pointer hover:underline",
        isHighlighted && "font-medium",
        className
      )}
      style={isHighlighted && highlightColor ? { 
        backgroundColor: `${highlightColor}20`, 
        borderBottom: `2px solid ${highlightColor}`,
        padding: '1px 4px', 
        borderRadius: '2px' 
      } : undefined}
      onMouseEnter={highlightable ? showPicker : undefined}
      onMouseLeave={highlightable ? hidePicker : undefined}
      onClick={isValid ? handleAddressClick : undefined}
      role={isValid ? "button" : undefined}
      tabIndex={isValid ? 0 : undefined}
      onKeyDown={
        isValid
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAddressClick(e as any)
              }
            }
          : undefined
      }
      aria-label={isValid ? `Go to address ${address}` : undefined}
    >
      {displayText || (displayAbbreviatedAddress ? abbreviatedAddress : address)}
    </span>
  )

  // Show full address on hover if tooltip is enabled
  const wrappedDisplay = fullAddressOnHover && showTooltip ? (
    <TooltipProvider>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          {displayElement}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm break-all max-w-80">{isValid ? address : 'Invalid Solana address'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : displayElement

  // --- Portal-based color picker positioning ---
  const [pickerPos, setPickerPos] = useState<{top: number, left: number} | null>(null)
  useEffect(() => {
    if (showColorPicker && highlightable && addressRef.current) {
      const rect = addressRef.current.getBoundingClientRect()
      setPickerPos({
        top: rect.bottom + window.scrollY + 4, // 4px margin
        left: rect.left + window.scrollX
      })
    }
  }, [showColorPicker, highlightable])

  // Color picker component - now rendered in a portal
  let colorPickerComponent = null
  if (showColorPicker && highlightable && pickerPos && typeof window !== 'undefined' && document.body) {
    colorPickerComponent = createPortal(
      <div 
        ref={colorPickerRef}
        className="z-50 p-2 bg-card/95 shadow-lg rounded-md border backdrop-blur-sm"
        style={{
          minHeight: '36px',
          position: 'absolute',
          top: pickerPos.top,
          left: pickerPos.left,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={showPicker}
        onMouseLeave={hidePicker}
      >
        <div className="flex items-center gap-2">
          {HIGHLIGHT_COLORS.map(color => (
            <button
              key={color}
              className={cn(
                "w-5 h-5 rounded-sm border transition-all hover:scale-110",
                isHighlighted && highlightColor === color ? "ring-2 ring-offset-1" : ""
              )}
              style={{ backgroundColor: color }}
              onClick={() => applyHighlight(color)}
              aria-label={`Highlight with ${color} color`}
            >
              {isHighlighted && highlightColor === color && (
                <Check className="w-3 h-3 text-white m-auto" />
              )}
            </button>
          ))}
          {isHighlighted && (
            <button
              className="w-5 h-5 rounded-sm border border-destructive flex items-center justify-center bg-card hover:bg-destructive/10 transition-colors"
              onClick={removeHighlighting}
              aria-label="Remove highlight"
            >
              <X className="w-3 h-3 text-destructive" />
            </button>
          )}
        </div>
      </div>,
      document.body
    )
  }

  if (!showCopyButton) {
    return (
      <span 
        className="relative inline-block"
        ref={containerSpanRef}
      >
        {wrappedDisplay}
        {colorPickerComponent}
      </span>
    )
  }

  return (
    <div 
      className="inline-flex items-center gap-1 group relative"
      ref={containerDivRef}
    >
      {wrappedDisplay}
      <CopyToClipboardButton
        textToCopy={address}
        variant={ButtonVariant.GHOST}
        size={ButtonSize.SM}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <CopyIcon size={12} />
      </CopyToClipboardButton>
      
      {colorPickerComponent}
    </div>
  )
} 