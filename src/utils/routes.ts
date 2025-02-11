'use client'

const routes = {
  home: () => '/',
  address: ({ id }: { id: string }) => `/${id}`,
  trade: () => '/trade',
  tradeId: ({ id }: { id: string }) => `/trade/${id}`,
  namespace: ({ namespace }: { namespace: string }) =>
    `/namespace/${namespace}`,
}

export function route<T extends keyof typeof routes>(
  name: T,
  params?: Parameters<(typeof routes)[T]>[0]
) {
  if (typeof window === 'undefined') return routes[name](params as any)

  const pathname = window.location.pathname
  const locale = pathname.split('/')[1]

  return `/${locale}${routes[name](params as any)}`
}
