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
                { error: 'Token mint address is required' },
                { status: 400 }
            )
        }

        const options = { method: 'GET', headers: { accept: 'application/json' } };

        const response = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/${id}/listings?limit=30`, options)
        const data = await response.json()

        return NextResponse.json({
            collectionLists: data
        });
    } catch (error: any) {
        console.error('Error fetching nft collection lists:', error)
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to fetch nft collection lists'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}
