import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Get the consolidated cache
export async function getBlinkSiteUrls(): Promise<Record<string, any> | null> {
  try {
    const cached = await redis.get('blink-site-urls')
    return cached as Record<string, any> | null
  } catch (error) {
    console.error('Error getting blink-site-urls:', error)
    return null
  }
}

// Get site info for a specific host
export async function getBlinkSiteInfo(host: string): Promise<any | null> {
  try {
    const allSites = await getBlinkSiteUrls()
    if (allSites && host in allSites) {
      return allSites[host]
    }
    return null
  } catch (error) {
    console.error(`Error getting info for ${host}:`, error)
    return null
  }
}

// Example usage / test function
async function main() {
  console.log('Fetching consolidated blink site URLs from Redis...\n')

  const sites = await getBlinkSiteUrls()

  if (!sites) {
    console.log('No data found in Redis')
    return
  }

  console.log(`Total sites cached: ${Object.keys(sites).length}\n`)

  // Show a sample of sites
  const sample = Object.entries(sites).slice(0, 10)
  console.log('Sample of cached sites:')
  console.log('='.repeat(80))

  for (const [host, info] of sample) {
    console.log(`Host: ${host}`)
    console.log(`  Common Name: ${info.commonName}`)
    console.log(`  Method: ${info.method}`)
    console.log(`  State: ${info.state}`)
    if (info.actualUrl) {
      console.log(`  Actual URL: ${info.actualUrl}`)
    }
    if (info.favicon) {
      console.log(`  Favicon: ${info.favicon}`)
    }
    console.log(`  Last Updated: ${info.lastUpdated}`)
    console.log('-'.repeat(80))
  }

  // Get summary stats
  const summary = await redis.get('action-names:summary')
  if (summary) {
    console.log('\nSummary Statistics:')
    console.log(summary)
  }

  // Test specific lookup
  console.log('\n\nTesting specific lookup for "www.magiceden.io":')
  const meInfo = await getBlinkSiteInfo('www.magiceden.io')
  if (meInfo) {
    console.log(meInfo)
  } else {
    console.log('Not found')
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
