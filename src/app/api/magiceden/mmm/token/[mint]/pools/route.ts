import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
    params: Promise<{ mint: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const params = await context.params
        const { mint } = params

        if (!mint) {
            return NextResponse.json(
                { error: 'nft mint address is required' },
                { status: 400 }
            )
        }
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        const response = await fetch(`https://api-mainnet.magiceden.dev/v2/mmm/token/${mint}/pools`, options)
        const data = await response.json()

        if (data.results) {
            const [result] = data.results
            console.log("result", result)
            return NextResponse.json({
                pool: result.poolKey,
                minPaymentAmount: result.spotPrice / LAMPORTS_PER_SOL,
            });
        } else {
            return NextResponse.json(
                { error: 'No nft mint address' },
            );
        }

    } catch (error: any) {
        console.error('Error fetching best offers for an NFT:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Failed fetching best offers for an NFT'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}