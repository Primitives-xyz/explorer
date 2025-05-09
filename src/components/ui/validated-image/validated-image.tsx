'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface props {
  src: string
  alt: string
  className?: string
  width: number
  height: number
}

export function ValidatedImage({ src, alt, className, width, height }: props) {
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
        className={`rounded-full bg-muted shrink-0 ${className ?? ''}`}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  )
}
