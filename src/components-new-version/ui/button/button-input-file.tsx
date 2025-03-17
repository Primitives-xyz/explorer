'use client'

import { cn } from '@/utils'
import { ChangeEvent, useRef, useState } from 'react'
import { Input } from '../form/input'
import { Button, ButtonProps } from './button'

interface Props extends ButtonProps {
  acceptedFileType?: string
  maxFileSize?: number
  containerClassName?: string
  onFileChange: (file: File) => void
}

export function ButtonInputFile({
  acceptedFileType = 'image/*',
  maxFileSize = 5e6, // 5mb
  containerClassName,
  onFileChange,
  ...props
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string>()

  const handleClick = () => {
    inputRef?.current?.click()
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      if (file.size > maxFileSize) {
        setError(`file is too large! max size is ${maxFileSize / 1e6} mb`)
      } else {
        onFileChange(file)
      }
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      <Button onClick={handleClick} {...props}>
        <Input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          containerClassName="hidden"
          maxLength={maxFileSize}
          accept={acceptedFileType}
        />
        {props.children}
      </Button>
      {!!error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
