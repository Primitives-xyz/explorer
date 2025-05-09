function toQueryString(
  params: Record<string, string | number | boolean | undefined>
) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&')
}

const routes = {
  home: () => '/',
  discover: () => '/discover',
  entity: ({ id }: { id: string }) => `/${id}`,
  designSystem: () => '/design-system',
  trade: (query?: Record<string, string | number | boolean>) =>
    `/trade${query ? `?${toQueryString(query)}` : ''}`,
  stake: () => '/stake',
  trenches: () => '/trenches',
  namespace: ({ id }: { id: string }) => `/namespace/${id}`,
  namespaceProfile: ({ id, profile }: { id: string; profile: string }) =>
    `/namespace/${id}/${profile}`,
}

export function route<T extends keyof typeof routes>(
  name: T,
  params?: Parameters<(typeof routes)[T]>[0]
) {
  return routes[name](params as any)
}
