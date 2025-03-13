import { ProfileContent } from '@/components/profile/profile-content'
import { FetchMethod } from '@/utils/api'
import { generateProfileMetadata } from '@/utils/metadata'
import { ProfileMetadata } from '@/utils/metadata/profile-metadata'
import { fetchTapestryServer } from '@/utils/tapestry-server'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ namespace: string; profile: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { namespace, profile } = await params

  // Default metadata as fallback
  const defaultMetadata: Metadata = {
    title: `${profile} | ${namespace} | Explorer`,
    description: `View profile ${profile} in namespace ${namespace}`,
  }

  try {
    // First, fetch the following list
    const data = await fetchTapestryServer({
      endpoint: `profiles/${profile}?namespace=${namespace}`,
      method: FetchMethod.GET,
    })

    const profileData: ProfileMetadata = data.profile

    return await generateProfileMetadata(profile, profileData)
  } catch (error) {
    console.error('Error generating metadata on get namespace profile:', error)
    return defaultMetadata
  }
}

export default async function NamespaceProfilePage({ params }: Props) {
  try {
    const { namespace, profile } = await params
    return <ProfileContent username={profile} namespace={namespace} />
  } catch (exception) {
    console.error('Error loading profile:', exception)
    return <div>Error loading profile</div>
  }
}

// Force dynamic rendering to ensure data is always fresh
export const dynamic = 'force-dynamic'
