import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const buyer = searchParams.get('buyer')
        const seller = searchParams.get('seller')
        const auctionHouseAddress = searchParams.get('auctionHouseAddress')
        const tokenMint = searchParams.get('tokenMint')
        const tokenATA = searchParams.get('tokenATA')
        const price = searchParams.get('price')
        const newPrice = searchParams.get('newPrice')
        const sellerExpiry = searchParams.get('sellerExpiry')
        const ME_API_KEY = process.env.NEXT_ME_API_KEY || ""

        if (!buyer || !seller || !seller || !tokenMint || !tokenATA || !price || !newPrice || !sellerExpiry) {
            return NextResponse.json(
                { error: "endpoint query requested" },
                { status: 400 }
            )
        }

        if (!ME_API_KEY.length) {
            return NextResponse.json(
                { error: 'No Bearer token' },
                { status: 400 }
            )
        }

        const requestURL = `https://api-mainnet.magiceden.dev/v2/instructions/sell_now?buyer=${buyer}&seller=${seller}&auctionHouseAddress=${auctionHouseAddress}&tokenMint=${tokenMint}&tokenATA=${tokenATA}&price=${price}&newPrice=${newPrice}&sellerExpiry=1744358280`

        const response = await fetch(requestURL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${ME_API_KEY}`,
            },
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch Nft sell transaction data' },
                { status: 400 }
            )
        }

        const txData = await response.json()
        const serializedTxData = new Uint8Array(txData.txSigned.data)
        const buffer = Buffer.from(serializedTxData).toString('base64')

        return NextResponse.json({ sellTx: buffer })

    } catch (error: any) {
        console.error('Error fetching sell Tx for an NFT:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Error fetching sell Tx for an NFT'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}