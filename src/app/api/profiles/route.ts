// app/api/profiles/findAllProfiles/route.ts

import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_TAPESTRY_URL || 'https://api.usetapestry.dev/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_TAPESTRY_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  const tapestryUrl = `${BASE_URL}/profiles/?apiKey=${API_KEY}&walletAddress=${walletAddress}&shouldIncludeExternalProfiles=true`;
  
  try {
    const response = await fetch(tapestryUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Tapestry:', error);
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}
