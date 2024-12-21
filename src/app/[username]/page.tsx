import { ProfileContent } from '@/components/profile/profile-content'

type Params = Promise<{ username: string }>

export default async function ProfilePage({ params }: { params: Params }) {
  const resolvedParams = await params
  const { username } = resolvedParams
  return <ProfileContent username={username} />
}

export const dynamic = 'force-dynamic'
