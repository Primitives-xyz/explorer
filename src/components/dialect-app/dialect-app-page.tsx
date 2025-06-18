'use client'

import { Button, ButtonVariant } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Masonry from 'react-masonry-css'
import useRegistryList from './hooks/use-registry-list'
import { BlinkComponent } from './mini-blink-component'

export function DialectAppPage({ id }: { id: string }) {
  const { registryList, loading, websites } = useRegistryList({
    appName: id,
  })
  const [validItems, setValidItems] = useState<string[]>([])
  const [isValidLoading, setIsValidLoading] = useState<boolean>(false)

  useEffect(() => {
    try {
      const checkItems = async () => {
        setIsValidLoading(true)
        const validUrls: string[] = []

        for (const item of registryList) {
          try {
            const response = await fetch(
              `https://api.dial.to/v1/blink?apiUrl=${item.actionUrl}`
            )
            if (response.ok) {
              validUrls.push(item.actionUrl)
            }
          } catch (error) {
            console.log(`Failed to check item: ${item.actionUrl}`, error)
          }
        }

        setValidItems(validUrls)
        setIsValidLoading(false)
      }

      if (registryList.length > 0) {
        checkItems()
      }
    } catch (error) {
      console.log('Error checking items', error)
    }
  }, [registryList])

  const breakpointColumnsObj = {
    default: 3,
    1280: 2,
    1028: 1,
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-4 flex flex-col">
      <div className="flex flex-row gap-4">
        <div className="flex justify-center items-center">
          {loading ? (
            <Skeleton className="w-[64px] h-[64px] rounded-full" />
          ) : (
            <>
              {websites.length > 0 && (
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${websites[0]}&sz=64`}
                  alt="Website favicon"
                  width={64}
                  height={64}
                  className="object-cover"
                />
              )}
            </>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          {id && (
            <Button
              variant={ButtonVariant.OUTLINE}
              className="w-fit text-lg font-bold h-fit"
            >
              {id}
            </Button>
          )}

          {loading ? (
            <Skeleton className="w-[108px] h-8" />
          ) : (
            <>
              {websites.length > 0 && (
                <Button
                  variant={ButtonVariant.OUTLINE}
                  href={`https://${websites[0]}`}
                  newTab
                  className="h-8 w-[108px] justify-start"
                >
                  <Globe size={16} />
                  <span className="text-sm">Website</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {loading || isValidLoading ? (
        <div className="text-center text-xl font-bold h-[calc(100vh-200px)] flex items-center justify-center">
          Loading...
        </div>
      ) : (
        <>
          {validItems.length > 0 ? (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-4"
              columnClassName="flex flex-col gap-4"
            >
              {validItems.map((item, index) => (
                <div key={index} className="w-full h-fit object-contain">
                  <BlinkComponent actionUrl={item} />
                </div>
              ))}
            </Masonry>
          ) : (
            <div className="text-center text-xl font-bold h-[calc(100vh-200px)] flex items-center justify-center">
              No Blinks found
            </div>
          )}
        </>
      )}
    </div>
  )
}
