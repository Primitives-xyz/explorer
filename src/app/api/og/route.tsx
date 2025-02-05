import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title')
    const description = searchParams.get('description')
    const image = searchParams.get('image')

    // Fetch and convert SVG to PNG if it's an SVG image
    let imageData = image
    if (image?.endsWith('svg')) {
      try {
        const response = await fetch(image)
        const svg = await response.text()
        // Add width and height attributes to the SVG
        const svgWithSize = svg.replace('<svg', '<svg width="40" height="40"')
        imageData = `data:image/svg+xml;base64,${Buffer.from(
          svgWithSize,
        ).toString('base64')}`
      } catch (error) {
        console.error('Error fetching SVG:', error)
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#030711',
            padding: '40px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgb(22 163 74)',
              borderRadius: '16px',
              padding: '40px',
              background: 'rgba(22, 163, 74, 0.1)',
              width: '100%',
              height: '100%',
            }}
          >
            {imageData && (
              <div
                style={{
                  marginBottom: '30px',
                  borderRadius: '100px',
                  border: '2px solid rgb(22 163 74)',
                  padding: '4px',
                  background: 'rgba(22, 163, 74, 0.1)',
                }}
              >
                <img
                  src={imageData}
                  alt={title || 'Profile Image'}
                  style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '90px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Title */}
            <div
              style={{
                fontSize: 60,
                fontFamily: 'monospace',
                color: '#4ade80',
                marginBottom: '10px',
                textAlign: 'center',
                maxWidth: '900px',
                wordWrap: 'break-word',
              }}
            >
              {title || 'Explorer'}
            </div>

            {/* Description */}
            {description && (
              <div
                style={{
                  fontSize: 30,
                  fontFamily: 'monospace',
                  color: '#22c55e',
                  textAlign: 'center',
                  maxWidth: '800px',
                  wordWrap: 'break-word',
                }}
              >
                {description}
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e) {
    console.error(e)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
