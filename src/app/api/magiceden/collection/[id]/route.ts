import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
    params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const params = await context.params
        const { id } = params

        if (!id) {
            return NextResponse.json(
                { error: 'collection mint address is required' },
                { status: 400 }
            )
        }
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        const response = await fetch(`https://api-mainnet.magiceden.us/v2/unifiedSearch/xchain/collection/${id}`, options)
        const data = await response.json()

        if (data) {
            return NextResponse.json({
                collectionSymbol: data.solana[0].symbol || "",
            });
        } else {
            return NextResponse.json(
                { error: 'No collection mint address' },
            );
        }

    } catch (error: any) {
        console.error('Error fetching collection symbol:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Failed fetching collection symbol'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}