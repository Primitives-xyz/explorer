import { NextResponse } from 'next/server'

interface RegistryItem {
  host: string
  state: string
}

interface RegistryResponse {
  actions: RegistryItem[]
  websites: RegistryItem[]
  interstitials: RegistryItem[]
}

interface RegistryV1Item {
  actionUrl: string
  blinkUrl: string | null
  websiteUrl: string | null
  createdAt: string
  tags: string[]
}

interface RegistryV1Response {
  results: RegistryV1Item[]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const appName = searchParams.get('app_name')

    console.log('appName', appName)

    if (!appName) {
      return NextResponse.json(
        { error: 'app_name parameter is required' },
        { status: 400 }
      )
    }

    // Fetch from first endpoint
    const response1 = await fetch('https://actions-registry.dial.to/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response1.ok) {
      throw new Error(`Failed to fetch registry list: ${response1.statusText}`)
    }

    const data1: RegistryResponse = await response1.json()
    console.log('data1', data1)

    // Fetch from second endpoint
    const response2 = await fetch('https://registry.dial.to/v1/list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response2.ok) {
      throw new Error(
        `Failed to fetch registry v1 list: ${response2.statusText}`
      )
    }

    const data2: RegistryV1Response = await response2.json()

    // Validate the response structure
    if (!data1.actions || !data1.websites || !data1.interstitials) {
      throw new Error('Invalid response structure from registry API')
    }

    // Filter actions for sendarcade.fun and trusted state
    const filteredActions: RegistryItem[] = data1.actions.filter(
      (item) => item.host.includes(appName) && item.state === 'trusted'
    )

    const filteredWebsites: RegistryItem[] = data1.websites.filter(
      (item) => item.host === appName && item.state === 'trusted'
    )

    // Get the hosts from filtered actions
    const filteredHosts: string[] = filteredActions.map((item) => item.host)

    console.log('filteredHosts', filteredHosts)

    // Filter v1 results based on the hosts from filtered actions
    const filteredV1Results: RegistryV1Item[] = data2.results.filter((item) =>
      filteredHosts.some((host) => item.actionUrl.includes(host))
    )

    // Return combined filtered data
    return NextResponse.json({
      websites: filteredWebsites.map((item) => item.host),
      registryV1: filteredV1Results,
    })
  } catch (error) {
    console.error('Error fetching registry list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registry list' },
      { status: 500 }
    )
  }
}
