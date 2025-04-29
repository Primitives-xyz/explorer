'use client'

import { useEffect, useState } from 'react'

export type Size = {
  width: number
  height: number
}

const getSize = (element: HTMLElement | null) => {
  if (!element)
    return {
      width: 0,
      height: 0,
    }

  return {
    width: element.clientWidth,
    height: element.clientHeight,
  }
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const [ref, setRef] = useState<T | null>(null)
  const [size, setSize] = useState<Size>(getSize(ref))

  useEffect(() => {
    const updateElementSize = () => setSize(getSize(ref))
    updateElementSize()

    window.addEventListener('resize', updateElementSize)

    return () => {
      window.removeEventListener('resize', updateElementSize)
    }
  }, [ref])

  return {
    setRef,
    size,
    ref,
  }
}
