'use client'

const routes = {
  home: () => '/home',
  designSystem: () => '/design-system',
  trade: () => '/trade',
  swap: () => '/swap',
  discover: () => '/discover',
  tokens: () => '/tokens',
  profile: () => '/profile',
  address: ({ id }: { id: string }) => `/${id}`,
}

export function route<T extends keyof typeof routes>(
  name: T,
  params?: Parameters<(typeof routes)[T]>[0]
) {
  return routes[name](params as any)
}