import { contentServer } from '@/lib/content-server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const { profileId, targetProfileId } = await request.json()

  try {
    await contentServer.unlikeContent(id, profileId, targetProfileId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to unlike content' },
      { status: 500 }
    )
  }
}
