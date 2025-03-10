import { tapestryServer } from '@/lib/tapestry-server'
import { VersionedTransaction } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { sellerAddress, tokenMintAddress, tokenAccountAddress, price, auctionHouseAddress } = body
        const ME_API_KEY = process.env.NEXT_ME_API_KEY || ""

        if (!ME_API_KEY.length) {
            return NextResponse.json(
                { error: 'Missing ME API KEY' },
                { status: 400 }
            )
        }

        if (!sellerAddress || !tokenMintAddress || !tokenAccountAddress || !price) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }


        const baseUrl = "https://api-mainnet.magiceden.dev/v2/instructions/sell"
        const endpointUrl = `${baseUrl}?seller=${sellerAddress}&tokenMint=${tokenMintAddress}&tokenAccount=${tokenAccountAddress}&price=${price}&auctionHouseAddress=${auctionHouseAddress}`

        const response = await fetch(endpointUrl, {
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
        // const tx = VersionedTransaction.deserialize(serializedTxData)
        const buffer = Buffer.from(serializedTxData).toString('base64')

        return NextResponse.json({ sellTx: buffer })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch Nft sell transaction data' },
            { status: 400 }
        )
    }
}
