import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { RightSideLayout } from '@/components-new-version/common/right-side-layout'

interface ProfilePageProps {
  params: { id: string }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = params

  return (
    <>
      <OverflowContentWrapper>
        <h1>Profil de l'utilisateur {id}</h1>
      </OverflowContentWrapper>
      <RightSideLayout>
        <p>prout</p>
      </RightSideLayout>
    </>
  )
}
