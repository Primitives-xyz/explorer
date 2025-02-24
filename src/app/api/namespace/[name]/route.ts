import { contentServer } from '@/lib/content-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const name = request.url.split('/').pop() as string

  const namespaceDetails = await contentServer.getNamespaceDetails({ name })

  return NextResponse.json({ namespaceDetails })
}
