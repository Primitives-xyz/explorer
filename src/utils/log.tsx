'use client'

import { useEffect } from 'react'

interface Props {
  message: any
}

export function Log({ message }: Props) {
  useEffect(() => {
    console.log(`[Log]`, message)
  }, [message])

  return null
}
