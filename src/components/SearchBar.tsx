'use client'

import {
  SearchHistoryItem,
  addSearchToHistory,
  getRecentSearches,
} from '@/utils/searchHistory'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  onPickRecentAddress?: (addr: string) => void
}

export default function SearchBar({ onPickRecentAddress }: SearchBarProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load recent searches
    loadRecentSearches()

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadRecentSearches() {
    try {
      const searches = await getRecentSearches()
      setRecentSearches(searches)
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (inputValue) {
      // On form submit, we call handleSearch from props
      await addSearchToHistory(inputValue)
      await loadRecentSearches()
      setShowDropdown(false)

      // Add navigation
      router.push(`/${inputValue}`)
    }
  }

  async function handleRecentSearchClick(address: string) {
    setShowDropdown(false)
    setInputValue(address)

    try {
      // Save to history first
      await addSearchToHistory(address)
      await loadRecentSearches()

      // If parent gave us a direct callback, call it
      if (onPickRecentAddress) {
        onPickRecentAddress(address)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  // Function to get dropdown position
  const getDropdownPosition = () => {
    if (!searchBarRef.current) return { top: 0, left: 0, width: 0 }
    const rect = searchBarRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + window.scrollY + 4, // 4px gap
      left: rect.left + window.scrollX,
      width: rect.width,
    }
  }

  // Render dropdown portal
  const renderDropdown = () => {
    if (!showDropdown) return null
    const { top, left, width } = getDropdownPosition()

    return createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
        }}
        className="fixed bg-black border border-green-800 max-h-60 overflow-y-auto shadow-lg z-[100]"
      >
        {recentSearches.length > 0 ? (
          recentSearches.map((search) => (
            <div
              key={search.walletAddress}
              onClick={() => handleRecentSearchClick(search.walletAddress)}
              className="p-2 hover:bg-green-900/20 cursor-pointer border-b border-green-800/30 
                         last:border-b-0 backdrop-blur-sm bg-black/95"
            >
              <div className="font-mono text-green-400 text-sm">
                {search.walletAddress}
              </div>
              <div className="text-green-600 text-xs">
                {new Date(search.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-green-600 font-mono text-sm border-b border-green-800/30 backdrop-blur-sm bg-black/95">
            {'>>> NO SEARCH HISTORY <<<'}
          </div>
        )}
      </div>,
      document.body,
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="text-green-500 text-xs mb-2 font-mono">
        <span className="opacity-60">SYSTEM:</span> Search a username or wallet address...
      </div>

      <div className="relative pb-8">
        <form onSubmit={handleSubmit} className="relative">
          <div
            ref={searchBarRef}
            className="flex items-center gap-2 bg-black/30 border border-green-800 p-2"
          >
            <span className="text-green-500 font-mono">$</span>
            <input
              type="text"
              placeholder="BprhcaJtUTER4e3ArG..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(true)}
              className="flex-1 bg-transparent font-mono text-green-400 placeholder-green-800 
                       focus:outline-none focus:ring-0 border-none text-sm"
            />

            <button
              type="submit"
              disabled={!inputValue}
              className="px-4 py-1 font-mono text-sm border border-green-600 text-green-400
                       hover:bg-green-900/20 disabled:opacity-50 disabled:hover:bg-transparent
                       transition-colors duration-150"
            >
              [EXECUTE]
            </button>
          </div>

          {renderDropdown()}

          <div className="absolute mt-2 left-0 right-0 text-xs font-mono">
            {inputValue ? (
              <span className="text-green-600">
                {`>>>`} READY TO ANALYZE {inputValue.slice(0, 8)}...
              </span>
            ) : (
              <span className="text-green-800">{`>>>`}_ AWAITING INPUT</span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
