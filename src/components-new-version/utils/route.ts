'use client'

const routes = {
  home: () => '/home',
  discover: () => '/discover',
  profile: ({ id }: { id: string }) => `/profile/${id}`,
  designSystem: () => '/design-system',
  trade: () => '/trade',
  tokens: () => '/tokens',
  address: ({ id }: { id: string }) => `/${id}`,
}

export function route<T extends keyof typeof routes>(
  name: T,
  params?: Parameters<(typeof routes)[T]>[0]
) {
  return routes[name](params as any)
}
