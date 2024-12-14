import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_TAPESTRY_URL || 'https://api.usetapestry.dev/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_TAPESTRY_API_KEY;

export async function GET(
  request: Request,
  { params }: { params: { profileId: string } }
) {
  const { profileId } = params;
  const tapestryUrl = `${BASE_URL}/profiles/${profileId}/following?apiKey=${API_KEY}`;
  
  try {
    const response = await fetch(tapestryUrl);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
  }
} 