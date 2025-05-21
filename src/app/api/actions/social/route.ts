import {
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
  ActionPostResponse,
  BLOCKCHAIN_IDS,
} from '@solana/actions'
import { NextRequest } from 'next/server'

// Set blockchain (mainnet or devnet)
const blockchain =
  process.env.NEXT_PUBLIC_NETWORK === 'devnet'
    ? BLOCKCHAIN_IDS.devnet
    : BLOCKCHAIN_IDS.mainnet

// Headers for the Blink API
const headers = {
  ...ACTIONS_CORS_HEADERS,
  'x-blockchain-ids': blockchain,
  'x-action-version': '2.4',
}

// Configuration for social platforms
const SOCIAL_PLATFORMS = {
  threads: {
    name: 'Threads',
    url: 'https://threads.net/@',
    icon: '/icons/threads.png',
    defaultUsername: 'nick_oxford',
  },
  mastodon: {
    name: 'Mastodon',
    url: 'https://mastodon.social/@',
    icon: '/icons/mastodon.png',
    defaultUsername: 'activitypub',
  },
  sse: {
    name: 'SSE',
    url: 'https://explorer.solana.com/address/',
    icon: '/icons/sse.png',
    defaultUsername: '',
  },
}

// Helper to extract platform and username from URL
function extractParams(url: URL): {
  platform: string | null
  username: string | null
} {
  // First check query parameters
  const platform = url.searchParams.get('platform')
  const username = url.searchParams.get('username')

  // If both parameters are present in query, use them
  if (platform && username) return { platform, username }

  // Otherwise check path format
  const segments = url.pathname.split('/')
  // expected format: /api/actions/social/<platform>/<username> or /api/actions/social/<username>
  const socialIdx = segments.findIndex((s) => s === 'social')

  if (socialIdx !== -1) {
    // If there's only one segment after "social", it's probably a username
    if (segments.length === socialIdx + 2) {
      // Format: /api/actions/social/<username>
      return {
        platform: null,
        username: decodeURIComponent(segments[socialIdx + 1]),
      }
    }
    // If there are two segments after "social", interpret as platform and username
    else if (segments.length === socialIdx + 3) {
      // Format: /api/actions/social/<platform>/<username>
      return {
        platform: segments[socialIdx + 1],
        username: decodeURIComponent(segments[socialIdx + 2]),
      }
    }
    // If there's an extra segment that might be a platform
    else if (segments.length > socialIdx + 1) {
      const potentialPlatform = segments[socialIdx + 1]
      // Check if it's a valid platform, otherwise treat it as a username
      if (potentialPlatform in SOCIAL_PLATFORMS) {
        return {
          platform: potentialPlatform,
          username:
            segments.length > socialIdx + 2
              ? decodeURIComponent(segments[socialIdx + 2])
              : null,
        }
      } else {
        return {
          platform: null,
          username: decodeURIComponent(potentialPlatform),
        }
      }
    }
  }

  return { platform: null, username: null }
}

// OPTIONS endpoint for CORS preflight
export const OPTIONS = async () => {
  return new Response(null, { headers })
}

// GET: Return metadata for the follow action
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const { platform, username } = extractParams(url)

  // If username is provided without platform, show all platform options for following this user
  if (username && !platform) {
    const response: ActionGetResponse = {
      type: 'action',
      icon: '/icons/social.png',
      title: `Follow @${username}`,
      description: `Connect with @${username} on social media`,
      label: `Choose a platform to follow @${username}`,
      links: {
        actions: Object.entries(SOCIAL_PLATFORMS).map(([id, info]) => ({
          type: 'transaction',
          href: `/api/actions/social/${id}/${username}`,
          label: `Follow on ${info.name}`,
          parameters: [],
        })),
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    })
  }

  // If no platform is specified, show all social follow options
  if (!platform) {
    const response: ActionGetResponse = {
      type: 'action',
      icon: '/icons/social.png',
      title: 'Follow on Social Media',
      description: 'Connect with me on various social platforms',
      label: 'Choose a platform',
      links: {
        actions: Object.entries(SOCIAL_PLATFORMS).map(([id, info]) => ({
          type: 'transaction',
          href: `/api/actions/social/${id}${
            info.defaultUsername ? `/${info.defaultUsername}` : ''
          }`,
          label: `Follow on ${info.name}`,
          parameters: [
            {
              name: 'username',
              label: `Follow @${info.defaultUsername || 'username'} on ${
                info.name
              }`,
              type: 'text',
              required: true,
            },
          ],
        })),
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    })
  }

  // If platform is specified but no username, show form to enter username
  if (!username) {
    const platformInfo =
      SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]

    if (!platformInfo) {
      return new Response(
        JSON.stringify({ error: 'Invalid platform specified' }),
        { status: 400, headers }
      )
    }

    const response: ActionGetResponse = {
      type: 'action',
      icon: platformInfo.icon,
      title: `Follow on ${platformInfo.name}`,
      description: `Connect with @${
        platformInfo.defaultUsername || 'username'
      } on ${platformInfo.name}`,
      label: `Enter ${platformInfo.name} username`,
      links: {
        actions: [
          {
            type: 'transaction',
            href: `/api/actions/social/${platform}${
              platformInfo.defaultUsername
                ? `/${platformInfo.defaultUsername}`
                : ''
            }`,
            label: `Follow on ${platformInfo.name}`,
            parameters: [
              {
                name: 'username',
                label: `Follow @${
                  platformInfo.defaultUsername || 'username'
                } on ${platformInfo.name}`,
                type: 'text',
                required: true,
              },
            ],
          },
        ],
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    })
  }

  // If both platform and username are specified, show confirmation
  const platformInfo =
    SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]

  if (!platformInfo) {
    return new Response(
      JSON.stringify({ error: 'Invalid platform specified' }),
      { status: 400, headers }
    )
  }

  const response: ActionGetResponse = {
    type: 'action',
    icon: platformInfo.icon,
    title: `Follow @${username} on ${platformInfo.name}`,
    description: `Sign a message to follow @${username} on ${platformInfo.name}`,
    label: `Follow @${username}`,
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  })
}

// POST: Process the follow request
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const { platform, username } = extractParams(url)
    const { account } = await req.json()

    if (!platform || !username || !account) {
      return new Response(
        JSON.stringify({
          error: 'platform, username, and account are required',
        }),
        { status: 400, headers }
      )
    }

    const platformInfo =
      SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]

    if (!platformInfo) {
      return new Response(
        JSON.stringify({ error: 'Invalid platform specified' }),
        { status: 400, headers }
      )
    }

    // Generate the social profile URL
    const profileUrl = `${platformInfo.url}${username}`

    // Here you would typically make a blockchain transaction
    // For this example, we're just returning a message-type response
    const response: ActionPostResponse = {
      type: 'post',
      message: `Successfully connected with @${username} on ${platformInfo.name}`,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers,
    })
  } catch (error: any) {
    console.error('Error processing social follow request:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers }
    )
  }
}
