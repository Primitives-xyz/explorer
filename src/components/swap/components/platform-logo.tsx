import { Circle } from 'lucide-react'
import Image from 'next/image'

// Define a mapping of platform names to their logo paths
const PLATFORM_LOGOS: Record<string, string> = {
  sse: '/dexlogos/sse.svg',
  jupiter: '/dexlogos/jupiter.webp',
  raydium: '/dexlogos/raydium.svg',
  orca: '/dexlogos/orca.svg',
  'meteora dlmm': '/dexlogos/meteora.png',
  phantom: '/dexlogos/phantom.svg',
  backpack: '/dexlogos/backpack.svg',
  photon: '/dexlogos/photon.svg',
  bullx: '/dexlogos/bullux.svg',
  axiom: '/dexlogos/axiom.svg',
}

interface PlatformLogoProps {
  name: string
}

export function PlatformLogo({ name }: PlatformLogoProps) {
  const normalizedName = name.toLowerCase()
  const logoPath = PLATFORM_LOGOS[normalizedName]

  if (!logoPath) {
    return <Circle className="w-8 h-8 text-muted" aria-hidden="true" />
  }

  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
      <Image
        src={logoPath || '/placeholder.svg'}
        alt={`${name} logo`}
        width={24}
        height={24}
        className="object-contain"
      />
    </div>
  )
}
