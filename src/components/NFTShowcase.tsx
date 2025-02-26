"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type NFT = {
  id: string
  name: string
  image: string
  collection: string
  rarity: number
}

export default function NFTShowcase({ walletAddress }: { walletAddress: string }) {
  const [nfts, setNfts] = useState<NFT[]>([])

  useEffect(() => {
    // Fetch NFTs here
    const mockNFTs: NFT[] = [
      {
        id: "1",
        name: "Cosmic Dreams #42",
        image: "/placeholder.svg?height=300&width=300",
        collection: "Cosmic Dreams",
        rarity: 0.01,
      },
      {
        id: "2",
        name: "Bored Ape #1234",
        image: "/placeholder.svg?height=300&width=300",
        collection: "Bored Ape Yacht Club",
        rarity: 0.05,
      },
      {
        id: "3",
        name: "Azuki #5678",
        image: "/placeholder.svg?height=300&width=300",
        collection: "Azuki",
        rarity: 0.03,
      },
      {
        id: "4",
        name: "Doodle #9012",
        image: "/placeholder.svg?height=300&width=300",
        collection: "Doodles",
        rarity: 0.02,
      },
    ]
    setNfts(mockNFTs)
  }, [])

  return (
    <Card className="bg-gray-800 text-white">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">NFT Showcase</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group">
                      <img
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-lg font-semibold truncate">{nft.name}</h3>
                          <p className="text-sm text-gray-300 truncate">{nft.collection}</p>
                        </div>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-primary/80">
                        Top {(nft.rarity * 100).toFixed(2)}%
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Click to view details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

