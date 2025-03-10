/**
 * Utility functions for handling namespaces
 */

interface Namespace {
  name: string
  readableName?: string
  faviconURL?: string | null
}

/**
 * Get a human-readable name for a namespace
 */
export const getReadableNamespace = (namespace: Namespace): string => {
  // Special cases for namespace display names
  const specialNames: Record<string, string> = {
    nemoapp: 'Explorer',
    farcaster_external: 'Farcaster',
    allDomains: 'All Domains',
  }

  return (
    specialNames[namespace.name] || namespace.readableName || namespace.name
  )
}

/**
 * Extract unique namespaces from a list of profiles
 */
export const extractUniqueNamespaces = (profiles: any[]): Namespace[] => {
  if (!profiles || !Array.isArray(profiles)) return []

  return Array.from(
    new Set(
      profiles
        .filter((p) => p?.namespace != null)
        .map((p) =>
          JSON.stringify({
            name: p.namespace.name,
            readableName: p.namespace.readableName,
            faviconURL: p.namespace.faviconURL,
          })
        )
    )
  ).map((str) => JSON.parse(str))
}
