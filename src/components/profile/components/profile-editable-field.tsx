'use client'

import { Button, Input, Textarea } from '@/components/ui'
import { Check, Edit3, X } from 'lucide-react'
import { useState } from 'react'

interface ProfileEditableFieldProps {
  value: string
  placeholder?: string
  isEditing: boolean
  onEdit: () => void
  onSave: (value: string) => Promise<void>
  onCancel: () => void
  maxLength?: number
  multiline?: boolean
  className?: string
  editClassName?: string
  loading?: boolean
  title?: string
}

export function ProfileEditableField({
  value,
  placeholder = '',
  isEditing,
  onEdit,
  onSave,
  onCancel,
  maxLength,
  multiline = false,
  className = '',
  editClassName = '',
  loading = false,
  title,
}: ProfileEditableFieldProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleSave = async () => {
    await onSave(localValue)
  }

  const handleCancel = () => {
    setLocalValue(value) // Reset to original value
    onCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
    if (e.key === 'Enter' && !multiline) {
      handleSave()
    }
  }

  if (isEditing) {
    return (
      <div className={`space-y-2 ${editClassName}`}>
        {multiline ? (
          <Textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className="resize-none min-h-[60px]"
            placeholder={placeholder}
            maxLength={maxLength}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <div className="flex items-center">
            <Input
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              className="font-bold text-base max-w-[200px]"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} disabled={loading}>
            <Check size={14} />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X size={14} />
          </Button>
          {maxLength && (
            <span className="text-xs text-muted-foreground ml-auto">
              {localValue.length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-start gap-2 group ${className}`}>
      <p className="flex-1">{value || placeholder}</p>
      <button
        onClick={onEdit}
        className="md:opacity-0 md:group-hover:opacity-100 opacity-60 transition-opacity p-1 hover:bg-muted rounded shrink-0"
        title={title}
      >
        <Edit3 size={14} />
      </button>
    </div>
  )
}
