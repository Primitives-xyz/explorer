'use client'

const routes = {
  home: () => '/',
  address: ({ id }: { id: string }) => `/${id}`,
}

export function route<T extends keyof typeof routes>(
  name: T,
  params?: Parameters<(typeof routes)[T]>[0]
) {
  return routes[name](params as any)
}
