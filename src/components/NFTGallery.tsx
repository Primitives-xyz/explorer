import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function NFTGallery({ walletAddress }: { walletAddress: string }) {
  // In a real app, you'd fetch the NFTs for the wallet address
  const nfts = [
    { id: 1, name: "Cool Cat #1234", image: "/placeholder.svg?height=200&width=200" },
    { id: 2, name: "Bored Ape #5678", image: "/placeholder.svg?height=200&width=200" },
    { id: 3, name: "Crypto Punk #9012", image: "/placeholder.svg?height=200&width=200" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nfts.map((nft) => (
            <div key={nft.id} className="relative aspect-square">
              <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                <p className="text-sm truncate">{nft.name}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

