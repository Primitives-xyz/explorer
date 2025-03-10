import { Connection } from '@solana/web3.js'
import { VersionedTransaction } from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
    params: Promise<{ mint: string }>
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const pool = searchParams.get('pool')
        const minPaymentAmount = searchParams.get('minPaymentAmount')
        const seller = searchParams.get('seller')
        const assetMint = searchParams.get('assetMint')
        const assetTokenAccount = searchParams.get('assetTokenAccount')
        const assetAmount = searchParams.get('assetAmount')

        if (!pool || !minPaymentAmount || !seller || !assetMint || !assetTokenAccount || !assetAmount) {
            return NextResponse.json(
                { error: "endpoint query requested" },
                { status: 400 }
            )
        }

        const requestURL = `https://api-mainnet.magiceden.us/v2/instructions/mmm/sol-fulfill-buy?pool=${pool}&minPaymentAmount=${minPaymentAmount}&seller=${seller}&assetMint=${assetMint}&assetTokenAccount=${assetTokenAccount}&assetAmount=${assetAmount}`
        const response = await fetch(requestURL, {
            method: "GET",
            headers: {
                accept: 'application/json'
            }
        })

        const data = await response.json()

        if (data) {
            console.log(data)

            const buffer = Buffer.from(data.v0.txSigned.data).toString('base64')
            return NextResponse.json({ sellTx: buffer })
        } else {
            return NextResponse.json({ error: "Error fetching best offers for an NFT" }, { status: 500 })
        }

    } catch (error: any) {
        console.error('Error fetching best offers for an NFT:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Failed fetching best offers for an NFT'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}