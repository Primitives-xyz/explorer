import { Redis } from '@upstash/redis'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Types
interface ActionHost {
  host: string
  state: string
}

interface SiteInfo {
  host: string
  commonName: string
  method: string
  timestamp: string
  actualUrl?: string // The URL that actually worked (if different from host)
  favicon?: string // URL to the site's favicon
}

// Fetch the actions registry
async function fetchActionsRegistry(): Promise<ActionHost[]> {
  const response = await fetch('https://actions-registry.dial.to/all')
  const data = (await response.json()) as { actions: ActionHost[] }
  return data.actions
}

// Helper to check if we should try the main domain
function shouldTryMainDomain(url: string): string | null {
  // Skip if it's already a main domain or uses www/app subdomains
  if (url.match(/^(www\.|app\.)/)) {
    return null
  }

  // Check if it has a subdomain that suggests it's an API/backend
  const apiSubdomains = [
    'api',
    'backend',
    'api-mainnet',
    'api-main',
    'actions',
    'blink',
    'api2',
    'api3',
  ]
  const parts = url.split('.')

  if (parts.length > 2) {
    const subdomain = parts[0]
    if (apiSubdomains.includes(subdomain)) {
      // Return the main domain
      return parts.slice(1).join('.')
    }
  }

  return null
}

// Helper to resolve favicon URL
function resolveFaviconUrl(
  faviconPath: string | undefined,
  baseUrl: string
): string | null {
  if (!faviconPath) return null

  // If it's already a full URL, return it
  if (faviconPath.startsWith('http://') || faviconPath.startsWith('https://')) {
    return faviconPath
  }

  // If it starts with //, add https:
  if (faviconPath.startsWith('//')) {
    return `https:${faviconPath}`
  }

  // If it's a relative path, resolve it against the base URL
  const base = new URL(`https://${baseUrl}`)

  // If it starts with /, it's relative to the domain root
  if (faviconPath.startsWith('/')) {
    return `${base.origin}${faviconPath}`
  }

  // Otherwise, it's relative to the current path
  return `${base.origin}/${faviconPath}`
}

// Method 1: Try to fetch site title/meta tags and favicon
async function fetchSiteTitle(url: string): Promise<{
  title: string | null
  status: number | null
  url: string
  favicon: string | null
}> {
  async function tryFetch(targetUrl: string): Promise<{
    title: string | null
    status: number | null
    favicon: string | null
  }> {
    try {
      // Simple timeout using Promise.race
      const fetchPromise = fetch(`https://${targetUrl}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ActionNameBot/1.0)',
        },
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000)
      })

      const response = await Promise.race([fetchPromise, timeoutPromise])

      // Log 404s and other errors
      if (response.status === 404) {
        return { title: null, status: 404, favicon: null }
      }

      if (!response.ok) {
        return { title: null, status: response.status, favicon: null }
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Try various meta tags and title
      const title = $('title').text().trim()
      const ogTitle = $('meta[property="og:title"]').attr('content')
      const twitterTitle = $('meta[name="twitter:title"]').attr('content')
      const siteName = $('meta[property="og:site_name"]').attr('content')
      const appName = $('meta[name="application-name"]').attr('content')

      // Try to find favicon
      let faviconPath: string | undefined

      // Try various favicon link tags in order of preference
      faviconPath =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        $('link[rel="apple-touch-icon"]').attr('href') ||
        $('link[rel="apple-touch-icon-precomposed"]').attr('href') ||
        $('meta[property="og:image"]').attr('content') // Fallback to og:image if no favicon

      // Resolve the favicon URL
      const favicon = resolveFaviconUrl(faviconPath, targetUrl)

      // If no favicon found in HTML, try the default /favicon.ico
      const finalFavicon = favicon || `https://${targetUrl}/favicon.ico`

      // Return the first non-empty value, prioritizing og:site_name and og:title
      const finalTitle =
        siteName || ogTitle || appName || twitterTitle || title || null
      return { title: finalTitle, status: 200, favicon: finalFavicon }
    } catch (error: any) {
      if (error.message === 'Timeout') {
        return { title: null, status: null, favicon: null }
      }
      return { title: null, status: null, favicon: null }
    }
  }

  // First try the original URL
  console.log(`  → Trying ${url}`)
  const firstResult = await tryFetch(url)

  // If successful and has a good title, use it
  if (firstResult.status === 200 && firstResult.title) {
    console.log(`  → Found: "${firstResult.title}"`)
    if (firstResult.favicon) {
      console.log(`  → Favicon: ${firstResult.favicon}`)
    }
    return { ...firstResult, url }
  }

  // If it's a 404 or failed, try the main domain
  const mainDomain = shouldTryMainDomain(url)
  if (mainDomain && (firstResult.status === 404 || !firstResult.title)) {
    console.log(`  → Trying main domain: ${mainDomain}`)
    const mainResult = await tryFetch(mainDomain)

    if (mainResult.status === 200 && mainResult.title) {
      console.log(`  → Found on main domain: "${mainResult.title}"`)
      if (mainResult.favicon) {
        console.log(`  → Favicon: ${mainResult.favicon}`)
      }
      return { ...mainResult, url: mainDomain }
    }
  }

  // Return the original result if main domain didn't help
  if (firstResult.status === 404) {
    console.log(`  → 404 Not Found`)
  } else if (firstResult.status) {
    console.log(`  → HTTP ${firstResult.status}`)
  } else {
    console.log(`  → Failed to fetch`)
  }

  return { ...firstResult, url }
}

// Method 2: Parse domain name for clues
function parseDomainName(host: string): string {
  // Remove www. prefix
  const domain = host.replace(/^www\./, '')

  // Remove common TLDs
  const name = domain.replace(
    /\.(com|io|app|xyz|fun|trade|art|dev|ai|markets?|bet|meme|finance|exchange|protocol|network|zone|world|link|click|online|site|tech|wtf|lol|tips|video|watch|earth|gold|one|pro|today|live|game|play|bot|fm|me|id|so|co|jp|to|gdn|health|ink)$/i,
    ''
  )

  // Handle subdomains
  const parts = name.split('.')
  const mainPart = parts[parts.length - 1] // Get the main part before TLD

  // Convert kebab-case and snake_case to space-separated
  const spacedName = mainPart
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaces

  // Capitalize words
  return spacedName
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Smart word splitter for compound words
function smartSplitWords(name: string): string {
  if (!name) return name

  // Common web3/crypto terms that should be split
  const commonTerms = [
    'protocol',
    'finance',
    'swap',
    'chain',
    'network',
    'pay',
    'market',
    'labs',
    'games',
    'trade',
    'exchange',
    'wallet',
    'stake',
    'vault',
    'bridge',
    'lend',
    'borrow',
    'yield',
    'farm',
    'pool',
    'dex',
    'dao',
    'nft',
    'defi',
    'token',
    'coin',
    'cash',
    'money',
    'bank',
    'safe',
    'link',
    'connect',
    'access',
    'portal',
    'gate',
    'hub',
    'center',
    'zone',
    'space',
    'verse',
    'world',
    'land',
    'city',
    'place',
    'bot',
    'app',
    'tech',
    'labs',
    'studio',
    'works',
    'soft',
    'ware',
    'pro',
    'plus',
    'max',
    'ultra',
    'super',
    'mega',
    'alpha',
    'beta',
    'art',
    'mint',
    'drop',
    'launch',
    'pad',
    'base',
    'home',
    'house',
  ]

  // First, handle obvious camelCase
  let result = name.replace(/([a-z])([A-Z])/g, '$1 $2')

  // Then check for compound words with common terms
  for (const term of commonTerms) {
    // Check if the name ends with this term (case insensitive)
    const regex = new RegExp(`([a-zA-Z]+)(${term})$`, 'i')
    result = result.replace(regex, (match, prefix, suffix) => {
      // Only split if prefix is a reasonable length (3+ chars)
      if (prefix.length >= 3) {
        return `${prefix} ${
          suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase()
        }`
      }
      return match
    })

    // Check if the name starts with this term
    const startRegex = new RegExp(`^(${term})([A-Z][a-z]+)`, 'i')
    result = result.replace(startRegex, (match, prefix, suffix) => {
      return `${
        prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase()
      } ${suffix}`
    })
  }

  // Handle all lowercase compound words by checking against common terms
  if (result.toLowerCase() === result) {
    for (const term of commonTerms) {
      const index = result.toLowerCase().lastIndexOf(term)
      if (index > 0 && index + term.length === result.length) {
        const prefix = result.substring(0, index)
        if (prefix.length >= 3) {
          result = `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${
            term.charAt(0).toUpperCase() + term.slice(1)
          }`
          break
        }
      }
    }
  }

  // Ensure proper capitalization
  return result
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim()
}

// Method 3: Use Anthropic Claude API (optional)
async function fetchNameWithLLM(
  host: string,
  siteTitle: string | null
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null
  }

  try {
    const prompt = siteTitle
      ? `Given the domain "${host}" with title "${siteTitle}", what is the most concise and recognizable name for this service? Respond with just the name, nothing else.`
      : `Given the domain "${host}", what is the most likely service or product name? Consider common naming patterns in crypto/web3. Respond with just the name, nothing else.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) return null

    const data = (await response.json()) as any
    return data.content[0]?.text?.trim() || null
  } catch (error) {
    console.error('LLM error:', error)
    return null
  }
}

// Process a single host
async function processHost(
  host: ActionHost,
  ignoreCache: boolean = false
): Promise<SiteInfo | null> {
  console.log(`Processing ${host.host}...`)

  // Skip if already cached (unless ignoring cache)
  if (!ignoreCache) {
    const cached = await redis.get(`action-name:${host.host}`)
    if (cached && typeof cached === 'object' && 'commonName' in cached) {
      console.log(`  → Cached: ${(cached as SiteInfo).commonName}`)
      stats.cached++
      return cached as SiteInfo
    }
  }

  // Method 1: Try to fetch site info
  const siteResult = await fetchSiteTitle(host.host)

  // Skip 404 sites
  if (siteResult.status === 404) {
    console.log(`  → Skipping (site no longer exists)`)
    stats.notFound++
    return null
  }

  // Method 2: Parse domain
  const parsedName = parseDomainName(host.host)

  // Method 3: Use LLM if available (only if we have a title or need help)
  const llmName = siteResult.title
    ? await fetchNameWithLLM(host.host, siteResult.title)
    : null

  // Determine the best name - prioritize site title
  let commonName = siteResult.title || llmName || parsedName
  let method = siteResult.title
    ? 'site-title'
    : llmName
    ? 'llm'
    : 'domain-parse'

  // Clean up the name
  if (commonName) {
    // Remove common suffixes and clean up
    commonName = commonName
      .replace(/\s*[-|–—]\s*.*$/, '') // Remove everything after dash
      .replace(/\s*[([{].*$/, '') // Remove parentheses/brackets content
      .trim()

    // Apply smart word splitting
    commonName = smartSplitWords(commonName).slice(0, 50) // Limit length after splitting
  }

  const siteInfo: SiteInfo = {
    host: host.host,
    commonName,
    method,
    timestamp: new Date().toISOString(),
    ...(siteResult.url !== host.host && { actualUrl: siteResult.url }),
    ...(siteResult.favicon && { favicon: siteResult.favicon }),
  }

  // Store in Redis
  await redis.set(`action-name:${host.host}`, siteInfo)
  console.log(`  → ${commonName} (via ${method})`)

  return siteInfo
}

// Process in batches to avoid overwhelming
async function processBatch(
  hosts: ActionHost[],
  batchSize: number = 5,
  ignoreCache: boolean = false
): Promise<SiteInfo[]> {
  const results: SiteInfo[] = []

  for (let i = 0; i < hosts.length; i += batchSize) {
    const batch = hosts.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((host) =>
        processHost(host, ignoreCache).catch((error) => {
          console.error(`Error processing ${host.host}:`, error)
          stats.errors++
          return null
        })
      )
    )

    // Filter out null results (404s) and add valid ones
    const validResults = batchResults.filter(
      (result): result is SiteInfo => result !== null
    )
    results.push(...validResults)

    // Small delay between batches
    if (i + batchSize < hosts.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return results
}

// Stats tracking
let stats = {
  total: 0,
  processed: 0,
  cached: 0,
  notFound: 0,
  errors: 0,
  byMethod: {} as Record<string, number>,
}

// Main function
async function main() {
  // Check if we should ignore cache

  console.log('Fetching actions registry...')
  const hosts = await fetchActionsRegistry()
  console.log(`Found ${hosts.length} hosts\n`)

  // Filter to only trusted hosts (optional)
  const trustedHosts = hosts.filter((h) => h.state === 'trusted')
  console.log(`Processing ${trustedHosts.length} trusted hosts...\n`)

  stats.total = trustedHosts.length

  // Process all hosts - you can adjust the slice to process more
  const batchSize = parseInt(process.env.BATCH_SIZE || '100')
  const results = await processBatch(trustedHosts.slice(0, batchSize), 5, true)

  stats.processed = results.length

  // Count methods
  stats.byMethod = results.reduce((acc, r) => {
    acc[r.method] = (acc[r.method] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Summary
  console.log('\n=== Summary ===')
  console.log(`Total hosts: ${stats.total}`)
  console.log(`Successfully processed: ${stats.processed}`)
  console.log(`404 Not Found: ${stats.notFound}`)
  console.log(`Errors: ${stats.errors}`)
  console.log(`Already cached: ${stats.cached}`)
  console.log('\nBy method:', stats.byMethod)

  // Create a consolidated cache object
  console.log('\nCreating consolidated cache...')
  const consolidatedCache: Record<string, any> = {}

  // Add all processed results
  for (const result of results) {
    consolidatedCache[result.host] = {
      commonName: result.commonName,
      method: result.method,
      state: 'trusted', // From the filter above
      ...(result.actualUrl && { actualUrl: result.actualUrl }),
      ...(result.favicon && { favicon: result.favicon }),
      lastUpdated: result.timestamp,
    }
  }

  // If not ignoring cache, also include existing cached entries not in this batch
  if (batchSize < trustedHosts.length) {
    console.log('Adding remaining cached entries...')
    const remainingHosts = trustedHosts.slice(batchSize)

    for (const host of remainingHosts) {
      const cached = await redis.get(`action-name:${host.host}`)
      if (cached && typeof cached === 'object' && 'commonName' in cached) {
        const siteInfo = cached as SiteInfo
        consolidatedCache[host.host] = {
          commonName: siteInfo.commonName,
          method: siteInfo.method,
          state: 'trusted',
          ...(siteInfo.actualUrl && { actualUrl: siteInfo.actualUrl }),
          ...(siteInfo.favicon && { favicon: siteInfo.favicon }),
          lastUpdated: siteInfo.timestamp,
        }
      }
    }
  }

  // Store the consolidated cache
  await redis.set('blink-site-urls', consolidatedCache)
  console.log(
    `\nStored ${
      Object.keys(consolidatedCache).length
    } entries in 'blink-site-urls'`
  )

  // Save summary to Redis
  await redis.set('action-names:summary', {
    ...stats,
    totalInCache: Object.keys(consolidatedCache).length,
    lastUpdated: new Date().toISOString(),
  })

  console.log(
    '\nDone! Names stored both individually and in consolidated cache "blink-site-urls"'
  )
}

// Run the script
main().catch(console.error)
