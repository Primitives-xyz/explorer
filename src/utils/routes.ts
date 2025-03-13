'use client'

const routes = {
  home: () => '/',
  graphVisualization: () => '/graph-visualization',
  address: ({ id }: { id: string }) => `/${id}`,
  trade: () => '/trade',
  tradeId: ({ id }: { id: string }) => `/trade/${id}`,
  namespace: ({ namespace }: { namespace: string }) => `/n/${namespace}`,
  namespaceProfile: ({
    namespace,
    username,
  }: {
    namespace: string
    username: string
  }) => `/n/${namespace}/${username}`,
}

export function route<T extends keyof typeof routes>(
  name: T,
  params?: Parameters<(typeof routes)[T]>[0]
) {
  return routes[name](params as any)
}
