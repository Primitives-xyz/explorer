import redis from '@/utils/redis'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch the blink-site-urls data from Redis
    const blinkSiteUrlsData = await redis.get('blink-site-urls')
    
    if (!blinkSiteUrlsData) {
      return NextResponse.json({ apps: {}, groupedByCommonName: {} })
    }

    // Parse the data (assuming it's stored as JSON string)
    const appsData = typeof blinkSiteUrlsData === 'string' 
      ? JSON.parse(blinkSiteUrlsData) 
      : blinkSiteUrlsData

    // Group by commonName
    const groupedByCommonName: Record<string, string[]> = {}

    Object.entries(appsData).forEach(([key, value]: [string, any]) => {
      const commonName = value.commonName || 'Unknown'
      if (!groupedByCommonName[commonName]) {
        groupedByCommonName[commonName] = []
      }
      groupedByCommonName[commonName].push(key)
    })

    return NextResponse.json({
      apps: appsData,
      groupedByCommonName
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching blink-site-urls data from Redis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apps data' },
      { status: 500 }
    )
  }
} 