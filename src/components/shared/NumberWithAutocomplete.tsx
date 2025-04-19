'use client'

import { Input } from '@/components/ui'
import { useState, useRef, useEffect } from 'react'

// Conversion constants
export const MILLION = 1_000_000
export const BILLION = 1_000_000_000

export type NumberWithAutocompleteProps = {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}

export const NumberWithAutocomplete = ({
  value,
  onChange,
  placeholder,
  className,
}: NumberWithAutocompleteProps) => {
  const [inputValue, setInputValue] = useState<string>('')
  const [displayValue, setDisplayValue] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize the input with the provided value
  useEffect(() => {
    const initialValue =
      typeof value === 'number' ? formatNumberWithCommas(value) : value.toString()
    setInputValue(initialValue)
    setDisplayValue(initialValue)
  }, [value])

  // Format numbers with commas
  const formatNumberWithCommas = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Generate suggestions based on input
  const generateSuggestions = (input: string): string[] => {
    const cleanedInput = input.toLowerCase().trim()
    const results: string[] = []

    // Generate million/billion suggestions if input contains 'm' or 'b'
    if (cleanedInput.match(/^\d+(\.\d+)?\s*m/)) {
      const numPart = parseFloat(cleanedInput.replace(/m.*/, '').trim())
      if (!isNaN(numPart)) {
        results.push(
          `${numPart} million (${formatNumberWithCommas(numPart * MILLION)})`
        )
      }
    }

    if (cleanedInput.match(/^\d+(\.\d+)?\s*b/)) {
      const numPart = parseFloat(cleanedInput.replace(/b.*/, '').trim())
      if (!isNaN(numPart)) {
        results.push(
          `${numPart} billion (${formatNumberWithCommas(numPart * BILLION)})`
        )
      }
    }

    return results
  }

  // Parse the display value to get the numeric value
  const parseValue = (displayVal: string): number | null => {
    // Match patterns like "10 million (10,000,000)" and extract the number in parentheses
    const match = displayVal.match(/\(([^)]+)\)/)
    if (match) {
      // If we have a formatted number in parentheses, remove commas and parse
      const numericStr = match[1].replace(/,/g, '')
      return parseFloat(numericStr)
    }

    // For direct numeric input
    const cleanedValue = displayVal.replace(/,/g, '').toLowerCase().trim()

    // Check for million/billion without the formatting
    if (cleanedValue.includes('million')) {
      const numPart = parseFloat(cleanedValue.replace('million', '').trim())
      return isNaN(numPart) ? null : numPart * MILLION
    }

    if (cleanedValue.includes('billion')) {
      const numPart = parseFloat(cleanedValue.replace('billion', '').trim())
      return isNaN(numPart) ? null : numPart * BILLION
    }

    // Regular number
    return parseFloat(cleanedValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setDisplayValue(newValue)

    const newSuggestions = generateSuggestions(newValue)
    setSuggestions(newSuggestions)
    setShowSuggestions(newSuggestions.length > 0)

    // If it's a plain number, update the actual value
    const parsedValue = parseValue(newValue)
    if (parsedValue !== null) {
      onChange(parsedValue)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setDisplayValue(suggestion)
    setShowSuggestions(false)

    const parsedValue = parseValue(suggestion)
    if (parsedValue !== null) {
      onChange(parsedValue)
    }
  }

  const handleBlur = () => {
    // Short delay to allow click on suggestion to work
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)

    // If the value is valid, make sure the numeric value is updated
    const parsedValue = parseValue(displayValue)
    if (parsedValue !== null) {
      onChange(parsedValue)
    }
  }

  const handleFocus = () => {
    const newSuggestions = generateSuggestions(inputValue)
    if (newSuggestions.length > 0) {
      setSuggestions(newSuggestions)
      setShowSuggestions(true)
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-md border border-input">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 hover:bg-accent cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 