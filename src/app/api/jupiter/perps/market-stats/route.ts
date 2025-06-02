import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mint = searchParams.get('mint');

    if (!mint) {
      return NextResponse.json(
        { error: 'Mint parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://perps-api.jup.ag/v1/market-stats?mint=${mint}`
    );

    if (!response.ok) {
      throw new Error(`Jupiter API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching market stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market stats' },
      { status: 500 }
    );
  }
} 