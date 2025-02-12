'use client'

const routes = {
  home: () => '/',
  trade: () => '/trade',
  tradeId: ({ id }: { id: string }) => `/trade/${id}`,
  address: ({ id }: { id: string }) => `/${id}`,
  namespace: ({ namespace }: { namespace: string }) =>
    `/namespace/${namespace}`,
  graphVisualization: () => '/graph-visualization',
}

export function route<T extends keyof typeof routes>(
  name: T,
  params?: Parameters<(typeof routes)[T]>[0]
) {
  return routes[name](params as any)
}
