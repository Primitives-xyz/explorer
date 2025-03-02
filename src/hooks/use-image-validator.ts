import { useEffect, useState } from 'react'

interface ImageValidationResult {
  isValid: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Custom hook to validate if an image URL is reachable
 * @param url The image URL to validate
 * @param timeout Optional timeout in milliseconds (default: 5000ms)
 * @returns Object containing validation state
 */
export function useImageValidator(
  url: string | null | undefined,
  timeout: number = 5000
): ImageValidationResult {
  const [result, setResult] = useState<ImageValidationResult>({
    isValid: false,
    isLoading: false,
    error: null,
  })

  useEffect(() => {
    if (!url) {
      setResult({
        isValid: false,
        isLoading: false,
        error: 'No URL provided',
      })
      return
    }

    let isMounted = true
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    setResult({
      isValid: false,
      isLoading: true,
      error: null,
    })

    // Function to validate the image URL
    const validateImage = async () => {
      try {
        // Try to fetch the image with a HEAD request first
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
        })

        if (!isMounted) return

        // Check if the response is valid and is an image
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.startsWith('image/')) {
            setResult({
              isValid: true,
              isLoading: false,
              error: null,
            })
            return
          }
        }

        // If HEAD request fails or isn't an image, try loading the image directly
        const img = new Image()

        img.onload = () => {
          if (isMounted) {
            setResult({
              isValid: true,
              isLoading: false,
              error: null,
            })
          }
        }

        img.onerror = () => {
          if (isMounted) {
            setResult({
              isValid: false,
              isLoading: false,
              error: 'Failed to load image',
            })
          }
        }

        // Set crossOrigin to anonymous to avoid CORS issues
        img.crossOrigin = 'anonymous'
        img.src = url
      } catch (error) {
        if (isMounted) {
          setResult({
            isValid: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      } finally {
        clearTimeout(timeoutId)
      }
    }

    validateImage()

    return () => {
      isMounted = false
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [url, timeout])

  return result
}
