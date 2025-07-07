import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Get a single action name
export async function getActionName(host: string): Promise<string | null> {
  try {
    const data = await redis.get(`action-name:${host}`)
    if (data && typeof data === 'object' && 'commonName' in data) {
      return (data as any).commonName
    }
    return null
  } catch (error) {
    console.error(`Error getting action name for ${host}:`, error)
    return null
  }
}

// Get multiple action names
export async function getActionNames(
  hosts: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}

  for (const host of hosts) {
    const name = await getActionName(host)
    if (name) {
      result[host] = name
    }
  }

  return result
}

// Example usage / test function
async function main() {
  // Test with a few hosts
  const testHosts = [
    'www.magiceden.io',
    'www.lulo.fi',
    'www.mallow.art',
    'www.mantis.app',
  ]

  console.log('Fetching action names from Redis...\n')

  for (const host of testHosts) {
    const data = await redis.get(`action-name:${host}`)
    if (data) {
      console.log(`${host}:`)
      console.log(`  Name: ${(data as any).commonName}`)
      console.log(`  Method: ${(data as any).method}`)
      console.log(`  Cached: ${(data as any).timestamp}\n`)
    } else {
      console.log(`${host}: Not found\n`)
    }
  }

  // Get summary
  const summary = await redis.get('action-names:summary')
  if (summary) {
    console.log('=== Summary ===')
    console.log(summary)
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error)
}
