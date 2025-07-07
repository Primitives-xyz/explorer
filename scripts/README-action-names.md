# Solana Action Names Fetcher

This set of scripts fetches and caches common names for Solana action/blink sites from the dial.to registry.

## Features

- Fetches site titles from meta tags (og:site_name, og:title, etc.)
- Falls back to main domain if subdomain (like api.\*) returns 404
- Smart word splitting for compound names (e.g., "AccessProtocol" → "Access Protocol")
- Extracts favicon URLs from various sources (link tags, og:image, or default /favicon.ico)
- Uses Anthropic Claude API for enhanced name detection (optional)
- Caches results in Redis with both individual and consolidated storage

## Scripts

### fetch-action-names.ts

Main script that processes action hosts and stores common names.

```bash
# Process first 100 sites (default)
npx tsx scripts/fetch-action-names.ts

# Process with custom batch size
BATCH_SIZE=200 npx tsx scripts/fetch-action-names.ts

# Ignore cache and reprocess all
IGNORE_CACHE=true npx tsx scripts/fetch-action-names.ts

# Or use command line flag
npx tsx scripts/fetch-action-names.ts --ignore-cache
```

### run-fetch-names.sh

Convenience wrapper script:

```bash
# Process with defaults
./scripts/run-fetch-names.sh

# Ignore cache
./scripts/run-fetch-names.sh --ignore-cache

# Custom batch size
./scripts/run-fetch-names.sh --batch-size 500

# Process all trusted hosts
./scripts/run-fetch-names.sh --all --ignore-cache
```

### get-blink-urls.ts

Retrieve and display cached site names:

```bash
# Show sample of cached sites
npx tsx scripts/get-blink-urls.ts
```

### get-action-names.ts

Get individual action names:

```bash
# Test retrieval of specific sites
npx tsx scripts/get-action-names.ts
```

## Redis Storage

Data is stored in two ways:

1. **Individual keys**: `action-name:{host}` - Contains full site info
2. **Consolidated cache**: `blink-site-urls` - All sites in one object for easy retrieval

### Example cached data:

```json
{
  "www.magiceden.io": {
    "commonName": "Magic Eden",
    "method": "site-title",
    "state": "trusted",
    "favicon": "https://www.magiceden.io/favicon.ico",
    "lastUpdated": "2025-01-27T15:30:00.000Z"
  },
  "api.hel.io": {
    "commonName": "Hel",
    "method": "site-title",
    "state": "trusted",
    "actualUrl": "hel.io",
    "favicon": "https://hel.io/favicon.ico",
    "lastUpdated": "2025-01-27T15:30:01.000Z"
  }
}
```

## Environment Variables

- `UPSTASH_REDIS_REST_URL` - Redis connection URL (required)
- `UPSTASH_REDIS_REST_TOKEN` - Redis auth token (required)
- `ANTHROPIC_API_KEY` - For enhanced name detection (optional)
- `BATCH_SIZE` - Number of sites to process (default: 100)
- `IGNORE_CACHE` - Set to "true" to reprocess all sites

## How it Works

1. Fetches the actions registry from https://actions-registry.dial.to/all
2. For each host:
   - Checks if already cached (unless ignoring cache)
   - Attempts to fetch the site and extract title from meta tags
   - Extracts favicon URL from link tags, og:image, or defaults to /favicon.ico
   - If subdomain fails (404), tries the main domain
   - Falls back to parsing the domain name
   - Optionally uses Claude API for better name detection
   - Applies smart word splitting for compound words
3. Stores results in Redis both individually and as a consolidated cache
4. The consolidated cache can be used as a drop-in replacement for the dial.to API with enhanced common names
