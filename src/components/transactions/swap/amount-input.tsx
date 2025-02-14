import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  onEffectiveAmountChange: (value: string) => void
  balance?: string
  isLoggedIn?: boolean
  isBalanceLoading?: boolean
  disabled?: boolean
  onHalf?: () => void
  onMax?: () => void
  error?: string | null
  validateAmount?: (value: string) => boolean
}

export function AmountInput({
  value,
  onChange,
  onEffectiveAmountChange,
  balance,
  isLoggedIn,
  isBalanceLoading,
  disabled,
  onHalf,
  onMax,
  error,
  validateAmount,
}: AmountInputProps) {
  const t = useTranslations()
  const inputRef = useRef<HTMLInputElement>(null)
  const [debouncedUpdate, setDebouncedUpdate] = useState<NodeJS.Timeout | null>(
    null
  )

  const updateEffectiveAmount = (value: string) => {
    if (debouncedUpdate) clearTimeout(debouncedUpdate)

    const timeout = setTimeout(() => {
      if (!validateAmount || validateAmount(value)) {
        if (value !== '') {
          onEffectiveAmountChange(value)
        } else {
          onEffectiveAmountChange('')
        }
      } else {
        onEffectiveAmountChange('')
      }
    }, 500) // 500ms delay

    setDebouncedUpdate(timeout)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">{t('common.amount')}</div>
        {isLoggedIn && !isBalanceLoading && balance && (
          <div className="flex items-center gap-2">
            {onHalf && (
              <button
                onClick={onHalf}
                className="uppercase text-xs bg-green-900/20 hover:bg-green-900/30 px-3 py-1 rounded transition-colors"
              >
                {t('common.half')}
              </button>
            )}
            {onMax && (
              <button
                onClick={onMax}
                className="uppercase text-xs bg-green-900/20 hover:bg-green-900/30 px-3 py-1 rounded transition-colors"
              >
                {t('common.max')}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          className={`bg-green-900/20 text-2xl  p-3 rounded-lg w-full font-medium placeholder:/50 ${
            error ? 'border border-red-500' : ''
          }`}
          value={value}
          onFocus={(e) => {
            e.preventDefault()
            const pos = e.target.selectionStart
            requestAnimationFrame(() => {
              e.target.focus()
              e.target.setSelectionRange(pos, pos)
            })
          }}
          onChange={(e) => {
            const value = e.target.value
            if (
              value === '' ||
              value === '.' ||
              /^[0]?\.[0-9]*$/.test(value) ||
              /^[0-9]*\.?[0-9]*$/.test(value)
            ) {
              const cursorPosition = e.target.selectionStart
              onChange(value)
              updateEffectiveAmount(value)
              window.setTimeout(() => {
                e.target.focus()
                e.target.setSelectionRange(cursorPosition, cursorPosition)
              }, 0)
            }
          }}
          disabled={disabled}
        />
        {isLoggedIn && !isBalanceLoading && balance && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
            {t('common.balance')}: {balance}
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-1 ml-1">{error}</p>}
    </div>
  )
}
