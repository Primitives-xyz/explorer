import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const account = searchParams.get('account')

  if (!account) {
    return NextResponse.json({ error: 'Account parameter is required' }, { status: 400 })
  }

  try {
    // TODO: Implement token account lookup logic here
    // For now, return a placeholder response
    return NextResponse.json({
      account,
      tokens: []
    })
  } catch (error) {
    console.error('Error fetching token account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token account' },
      { status: 500 }
    )
  }
} 