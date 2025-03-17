import { NFT } from '@/utils/types'
import { useEffect, useState } from 'react'

interface ImageState {
  url: string | null
  isLoading: boolean
  error: string | null
  source: 'direct' | 'cdn' | 'file' | 'json' | 'metadata' | null
}

export function useNFTImage(nft: NFT) {
  const content = nft?.content || false
  const [imageState, setImageState] = useState<ImageState>({
    url: null,
    isLoading: false,
    error: null,
    source: null,
  })

  useEffect(() => {
    if (!content && nft.imageUrl) {
      setImageState({
        url: nft.imageUrl,
        isLoading: false,
        error: null,
        source: 'direct',
      })
      return
    }

    async function resolveImage() {
      if (!content) {
        setImageState({
          url: null,
          isLoading: false,
          error: 'No content provided',
          source: null,
        })
        return
      }

      setImageState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        // 1. Direct image link from content.links
        if (content.links?.image) {
          setImageState({
            url: content.links.image,
            isLoading: false,
            error: null,
            source: 'direct',
          })
          return
        }

        // 2. CDN URI from first file
        if (content.files?.[0]?.cdn_uri) {
          setImageState({
            url: content.files[0].cdn_uri,
            isLoading: false,
            error: null,
            source: 'cdn',
          })
          return
        }

        // 3. URI from first file
        if (content.files?.[0]?.uri) {
          setImageState({
            url: content.files[0].uri,
            isLoading: false,
            error: null,
            source: 'file',
          })
          return
        }

        // 4. Try to fetch and parse json_uri if it exists
        if (content.json_uri) {
          try {
            const response = await fetch(content.json_uri)
            if (!response.ok) throw new Error('Failed to fetch JSON URI')

            const data = await response.json()

            // Check for image in the fetched JSON
            if (data.image) {
              setImageState({
                url: data.image,
                isLoading: false,
                error: null,
                source: 'json',
              })
              return
            }
          } catch (error) {
            // If json_uri is actually an image URL, use it directly
            if (content.json_uri.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              setImageState({
                url: content.json_uri,
                isLoading: false,
                error: null,
                source: 'json',
              })
              return
            }

            console.warn('Failed to fetch JSON URI:', error)
          }
        }

        // 5. Check metadata image as last resort
        if (content.files?.[0]?.uri) {
          setImageState({
            url: content.files[0].uri,
            isLoading: false,
            error: null,
            source: 'metadata',
          })
          return
        }

        // No image found
        setImageState({
          url: null,
          isLoading: false,
          error: 'No valid image found',
          source: null,
        })
      } catch (error) {
        setImageState({
          url: null,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to resolve image',
          source: null,
        })
      }
    }

    resolveImage()
  }, [content])

  return imageState
}
