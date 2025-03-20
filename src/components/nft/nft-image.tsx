import { useNFTImage } from '@/hooks/use-nft-image'
import { NFT } from '@/utils/types'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

interface NFTImageProps {
  nft: NFT
  onClick: (e: React.MouseEvent) => void
  viewMode: 'grid' | 'list'
}

export function NFTImage({ nft, onClick, viewMode }: NFTImageProps) {
  const { url: imageUrl, isLoading: imageLoading } = useNFTImage(nft)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleImageLoad = () => {
    setIsImageLoaded(true)
  }

  const handleImageError = () => {
    setHasError(true)
  }

  // Shimmer effect for loading state
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#0f172a" offset="20%" />
          <stop stop-color="#1e293b" offset="50%" />
          <stop stop-color="#0f172a" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#0f172a" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str)

  if (imageLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/40 animate-pulse">
        <svg
          className="w-10 h-10 text-green-500/40"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13.5099 16M14.1666 11.5C14.1666 11.5 15.5 10.5 16.5 10.5C17.5 10.5 18.8333 11.5 18.8333 11.5M6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25Z"
          ></path>
        </svg>
      </div>
    )
  }

  if (hasError || !imageUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black/80 to-green-950/30 p-4">
        <svg
          className="w-12 h-12 text-green-500/40 mb-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4.75 16L7.49619 12.5067C8.2749 11.5161 9.76453 11.4837 10.5856 12.4395L13.5099 16M14.1666 11.5C14.1666 11.5 15.5 10.5 16.5 10.5C17.5 10.5 18.8333 11.5 18.8333 11.5M6.75 19.25H17.25C18.3546 19.25 19.25 18.3546 19.25 17.25V6.75C19.25 5.64543 18.3546 4.75 17.25 4.75H6.75C5.64543 4.75 4.75 5.64543 4.75 6.75V17.25C4.75 18.3546 5.64543 19.25 6.75 19.25Z"
          ></path>
        </svg>
        <p className="text-xs text-green-400/70 text-center">
          {nft.name || 'NFT'} image unavailable
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden" onClick={onClick}>
      {/* Overlay gradient - reduced opacity from black/80 to black/30 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 pointer-events-none" />

      {/* Loading placeholder */}
      {!isImageLoaded && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(data:image/svg+xml;base64,${toBase64(
                shimmer(700, 700)
              )})`,
              backgroundSize: 'cover',
            }}
          />
        </div>
      )}

      {/* Actual image */}
      <motion.div
        className={`w-full h-full transition-opacity duration-300 ${
          isImageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.4 }}
      >
        <Image
          src={imageUrl}
          alt={nft.name || 'NFT'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={viewMode === 'list'}
        />
      </motion.div>
    </div>
  )
}
