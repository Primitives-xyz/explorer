import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  onEffectiveAmountChange: (value: string) => void
  balance?: string
  isLoggedIn?: boolean
  isBalanceLoading?: boolean
  isBalanceRefreshing?: boolean
  disabled?: boolean
  error?: string | null
  validateAmount?: (value: string) => boolean
  onQuarterClick?: () => void
  onHalfClick?: () => void
  onMaxClick?: () => void
  usdValue?: string | null
  isUsdValueLoading?: boolean
}

export function AmountInput({
  value,
  onChange,
  onEffectiveAmountChange,
  balance,
  isLoggedIn,
  isBalanceLoading,
  isBalanceRefreshing,
  disabled,
  error,
  validateAmount,
  onQuarterClick,
  onHalfClick,
  onMaxClick,
  usdValue,
  isUsdValueLoading,
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

  const isButtonDisabled =
    disabled || !balance || balance === '0' || isBalanceRefreshing

  const buttonClass =
    'text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/20 hover:border-green-500/30 active:scale-95'

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{t('common.amount')}</div>
        {isLoggedIn && !isBalanceLoading && balance && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-green-100/70 flex items-center gap-1">
              {t('common.balance')}:{' '}
              <span className={isBalanceRefreshing ? 'animate-pulse' : ''}>
                {balance}
              </span>
              {isBalanceRefreshing && (
                <svg
                  className="w-3 h-3 animate-spin text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={onQuarterClick}
                disabled={isButtonDisabled}
                className={buttonClass}
              >
                25%
              </button>
              <button
                onClick={onHalfClick}
                disabled={isButtonDisabled}
                className={buttonClass}
              >
                50%
              </button>
              <button
                onClick={onMaxClick}
                disabled={isButtonDisabled}
                className={buttonClass}
              >
                {t('common.max')}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="relative group">
        <div
          className={`bg-green-900/20 p-4 rounded-lg w-full transition-all duration-200 ${
            error
              ? 'border border-red-500/50'
              : 'border border-green-500/20 focus-within:border-green-500/30 focus-within:ring-2 focus-within:ring-green-500/20'
          }`}
        >
          <div className="flex flex-row items-baseline justify-between">
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              className="bg-transparent text-2xl w-full font-medium placeholder:text-green-100/30 outline-none"
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

            {usdValue && value && !isUsdValueLoading && (
              <div className="flex items-center text-sm text-green-100/70 ml-2 whitespace-nowrap">
                {usdValue}
              </div>
            )}
            {isUsdValueLoading && value && (
              <div className="flex items-center text-sm text-green-100/70 animate-pulse ml-2 whitespace-nowrap">
                $0.00
              </div>
            )}
          </div>
        </div>
        {disabled && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-lg cursor-not-allowed" />
        )}
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-2 ml-1 flex items-center gap-1">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
