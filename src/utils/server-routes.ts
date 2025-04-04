const routes = {
  home: () => '/',
  address: ({ id }: { id: string }) => `/${id}`,
  trade: () => '/trade',
  tradeId: ({ id }: { id: string }) => `/trade/${id}`,
  namespace: ({ namespace }: { namespace: string }) =>
    `/n/${namespace}`,
}

export function route<T extends keyof typeof routes>(
  name: T,
  params?: Parameters<(typeof routes)[T]>[0]
) {
  return routes[name](params as any)
}
