/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

function formatSmartNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

async function getImageData(url: string) {
  try {
    const response = await fetch(url)
    const contentType = response.headers.get('content-type') || ''
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    return `data:${contentType};base64,${base64}`
  } catch (error) {
    console.error('Error fetching image:', error)
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')
    const rawScore = searchParams.get('score')
    const profileImage = searchParams.get('profileImage')
    const badges = searchParams.get('badges')
      ? JSON.parse(searchParams.get('badges') || '[]')
      : []

    if (!rawScore || !username) {
      throw new Error('Score and username are required')
    }

    const score = formatSmartNumber(Number(rawScore))

    const decodedProfileImage = profileImage
      ? decodeURIComponent(profileImage)
      : null

    let imageDataUrl = null
    if (decodedProfileImage) {
      imageDataUrl = await getImageData(decodedProfileImage)
    }

    const url = new URL(req.url)
    const backgroundImageUrl = `${url.protocol}//${url.host}/images/menu/solid-score-share-modal-bg.png`

    const response = new ImageResponse(
      (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            width: '800px',
            height: '800px',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#030711',
          }}
        >
          <img
            src={backgroundImageUrl}
            alt="Background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '800px',
              height: '800px',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '600px',
              height: '600px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(74, 222, 128, 0.05)',
                borderRadius: '24px',
                zIndex: -1,
              }}
            />
            <p
              style={{
                fontSize: '32px',
                color: '#ffffff',
                margin: '0 0 40px 0',
              }}
            >
              My SOLID Score is...
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                justifyContent: 'center',
                marginBottom: '40px',
              }}
            >
              {imageDataUrl && (
                <img
                  src={imageDataUrl}
                  alt={username || 'Profile'}
                  width="48"
                  height="48"
                  style={{
                    borderRadius: '9999px',
                    objectFit: 'cover',
                  }}
                />
              )}
              <p
                style={{
                  fontSize: '32px',
                  color: '#ffffff',
                  paddingTop: '4px',
                  margin: 0,
                }}
              >
                {username}
              </p>
            </div>

            <div
              style={{
                height: '150px',
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Score */}
              <div
                style={{
                  fontSize: '144px',
                  fontWeight: 'bold',
                  color: '#4ade80',
                  textAlign: 'center',
                  lineHeight: '1',
                }}
              >
                {score}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '20px',
                paddingTop: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {badges.map((badge: string, index: number) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(74, 222, 128, 0.2)',
                      color: '#4ade80',
                      fontSize: '24px',
                    }}
                  >
                    {badge}
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: '24px',
                  color: '#6b7280',
                  margin: 0,
                  alignSelf: 'center',
                }}
              >
                Claim yours at SSE.gg
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 800,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=300, s-maxage=300',
        },
      }
    )

    return response
  } catch (e) {
    console.error('Error generating image:', e)
    return new Response(
      'Failed to generate Solid Score image: ' + (e as Error).message,
      {
        status: 500,
        headers: {
          'content-type': 'text/plain',
        },
      }
    )
  }
}
