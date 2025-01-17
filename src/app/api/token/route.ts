import { NextResponse } from 'next/server'
import { fetchTokenInfo } from '@/utils/helius/das-api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mint = searchParams.get('mint')

  if (!mint) {
    return NextResponse.json(
      { error: 'Missing mint parameter' },
      { status: 400 },
    )
  }

  try {
    const tokenInfo = await fetchTokenInfo(mint)
    if (!tokenInfo) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    return NextResponse.json(tokenInfo)
  } catch (error) {
    console.error('Error fetching token info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token info' },
      { status: 500 },
    )
  }
}
