'use client'

import { useAppsData } from '@/components/dialect-app/hooks/use-apps-data'
import Pagination from '@/components/trade/trade-content/transactions/pagination'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/components/ui'
import { RefreshCcwIcon, Search } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function AppsPage() {
  const { data, loading, error, refreshData, getStats } = useAppsData()
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'trusted' | 'untrusted'
  >('all')
  const [selectedMethod, setSelectedMethod] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading apps data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary text-xl">No Apps Available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Apps Dashboard
          </h1>
          <Button
            variant={ButtonVariant.DEFAULT_SOCIAL}
            onClick={refreshData}
            disabled={loading}
            className="px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 w-full sm:w-auto"
          >
            <RefreshCcwIcon className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10 border-green-500/30 border rounded-2xl p-4 sm:p-6 ring-2 ring-primary/50 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0 flex flex-col justify-between">
            <p className="text-lg sm:text-xl font-bold break-all">Total Apps</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {getStats()?.totalApps || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-indigo-500/10 border-indigo-500/30 border rounded-2xl p-4 sm:p-6 ring-2 ring-primary/50 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0 flex flex-col justify-between">
            <p className="text-lg sm:text-xl font-bold break-all">
              Unique Names
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {getStats()?.uniqueCommonNames || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/10 to-pink-500/10 border-purple-500/30 border rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0 flex flex-col justify-between">
            <p className="text-lg sm:text-xl font-bold break-all">
              Trusted Apps
            </p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {getStats()?.trustedApps || 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/10 to-orange-500/10 border-amber-500/30 border rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0 flex flex-col justify-between">
            <p className="text-lg sm:text-xl font-bold break-all">
              Untrusted Apps
            </p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {getStats()?.untrustedApps || 0}
            </p>
          </div>
        </div>

        <div className="space-y-6 mt-[80px] sm:mt-[120px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold">
              Apps by Common Name
            </h2>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Select
                  value={selectedFilter}
                  onValueChange={(value) =>
                    setSelectedFilter(value as 'all' | 'trusted' | 'untrusted')
                  }
                >
                  <SelectTrigger className="border-none text-primary h-9 w-full rounded-input sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border border-primary text-primary rounded-input">
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="trusted">Trusted Only</SelectItem>
                    <SelectItem value="untrusted">Untrusted Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedMethod}
                  onValueChange={(value) => setSelectedMethod(value)}
                >
                  <SelectTrigger className="border-none text-primary h-9 w-full rounded-input sm:w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border border-primary text-primary rounded-input">
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="site-title">Site Title</SelectItem>
                    <SelectItem value="domain-parse">Domain Parse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search appname..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-56 border-primary/30 focus:border-primary h-9"
                />
              </div>
            </div>
          </div>

          {(() => {
            // Filter and prepare data for pagination
            const filteredData = Object.entries(data.groupedByCommonName)
              .map(([commonName, appKeys]) => {
                const filteredAppKeys = appKeys.filter((appKey: string) => {
                  const app = data.apps[appKey]

                  // Search filter
                  if (
                    searchQuery &&
                    !appKey
                      .trim()
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  ) {
                    return false
                  }

                  if (selectedFilter === 'trusted' && app.state !== 'trusted')
                    return false
                  if (selectedFilter === 'untrusted' && app.state === 'trusted')
                    return false

                  if (selectedMethod !== 'all' && app.method !== selectedMethod)
                    return false

                  return true
                })

                if (filteredAppKeys.length === 0) return null

                return { commonName, appKeys: filteredAppKeys }
              })
              .filter(
                (item): item is { commonName: string; appKeys: string[] } =>
                  item !== null
              )
              .sort((a, b) => a.commonName.localeCompare(b.commonName))

            // Calculate pagination
            const totalItems = filteredData.length
            const totalPages = Math.ceil(totalItems / pageSize)
            const startIndex = (currentPage - 1) * pageSize
            const endIndex = startIndex + pageSize
            const paginatedData = filteredData.slice(startIndex, endIndex)

            // Reset to first page if current page is out of bounds
            if (currentPage > totalPages && totalPages > 0) {
              setCurrentPage(1)
            }

            return (
              <>
                {paginatedData.map(({ commonName, appKeys }) => (
                  <Card
                    key={commonName}
                    className="border-0 shadow-md bg-gradient-to-br from-background via-background to-muted/20"
                  >
                    <div className="px-4 sm:px-6 py-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-primary">
                        {commonName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {appKeys.length} app{appKeys.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <Separator className="my-2" />

                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {appKeys.map((appKey) => {
                          const app = data.apps[appKey]
                          return (
                            <div
                              key={appKey}
                              className="bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 rounded-lg p-3 hover:scale-105 transition-all duration-300 cursor-pointer"
                            >
                              <div className="flex items-center space-x-3 mb-3">
                                {app.favicon && (
                                  <Image
                                    src={app.favicon}
                                    alt={`${app.commonName} favicon`}
                                    className="w-6 h-6 rounded-full flex-shrink-0"
                                    width={24}
                                    height={24}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-green-700 dark:text-green-300 truncate">
                                    {appKey}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-white font-medium">
                                    Method:
                                  </span>
                                  <span className="text-right">
                                    {app.method}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-white font-medium">
                                    State:
                                  </span>
                                  <Button
                                    variant={ButtonVariant.BADGE}
                                    size={ButtonSize.SM}
                                  >
                                    {app.state}
                                  </Button>
                                </div>

                                <div className="flex justify-between text-sm">
                                  <span className="text-white font-medium">
                                    Updated:
                                  </span>
                                  <span className="font-medium text-right">
                                    {new Date(
                                      app.lastUpdated
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>
                ))}

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 gap-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">
                        Show:
                      </span>
                      <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => {
                          setPageSize(Number(value))
                          setCurrentPage(1) // Reset to first page when changing page size
                        }}
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                    />

                    <div className="text-sm text-muted-foreground text-center sm:text-right order-1 sm:order-3">
                      Showing {startIndex + 1} to{' '}
                      {Math.min(endIndex, totalItems)} of {totalItems} results
                    </div>
                  </div>
                )}

                {filteredData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No apps found matching your criteria.
                    </p>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
