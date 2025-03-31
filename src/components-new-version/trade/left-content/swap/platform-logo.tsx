import { Circle } from "lucide-react"
import Image from "next/image"

// Define a mapping of platform names to their logo paths
const PLATFORM_LOGOS: Record<string, string> = {
  sse: "/dexlogos/sse.svg",
  raydium: "/dexlogos/raydium.svg",
  orca: "/dexlogos/orca.svg",
  "meteora dlmm": "/dexlogos/meteora.png",
  phantom: "/dexlogos/phantom.svg",
  backpack: "/dexlogos/backpack.svg",
  photon: "/dexlogos/photon.svg",
  bullx: "/dexlogos/bullux.svg",
  axiom: "/dexlogos/axiom.svg",
}

interface PlatformLogoProps {
  name: string
}

export function PlatformLogo({ name }: PlatformLogoProps) {
  const normalizedName = name.toLowerCase()
  const logoPath = PLATFORM_LOGOS[normalizedName]

  if (!logoPath) {
    return <Circle className="w-8 h-8 text-gray-400" aria-hidden="true" />
  }

  return (
    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
      <Image src={logoPath || "/placeholder.svg"} alt={`${name} logo`} width={20} height={20} />
    </div>
  )
}