const routes = {
  home: () => '/',
  discover: () => '/discover',
  entity: ({ id }: { id: string }) => `/${id}`,
  designSystem: () => '/design-system',
  trade: (query?: string) => `/trade${query ? `?${query}` : ''}`,
  tokens: () => '/tokens',
  stake: () => '/stake',
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
