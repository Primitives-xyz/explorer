'use client'

import Image, { ImageProps } from 'next/image'
import { useEffect, useState } from 'react'

interface ValidatedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string
  alt: string
  fallbackClassName?: string
  unoptimized?: boolean
}

export function ValidatedImage({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  width,
  height,
  unoptimized = false,
  ...rest
}: ValidatedImageProps) {
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    if (!src || src.includes('ipfs://')) {
      setIsValid(false)
      return
    }

    const img = new window.Image()
    img.src = src
    img.onload = () => setIsValid(true)
    img.onerror = () => setIsValid(false)
  }, [src])

  if (!isValid) {
    return (
      <div
        style={{ width, height }}
        className={`bg-muted rounded-full shrink-0 ${
          fallbackClassName || className
        }`}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover w-full h-full rounded-full ${className}`}
      unoptimized={unoptimized}
      {...rest}
    />
  )
}
