'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Heading3,
  Paragraph,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabVariant,
} from '@/components/ui'
import { ProfileExternalProfiles } from './profile-external-profiles'

interface Props {
  walletAddress: string
}

export function ProfileSocial({ walletAddress }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="external-profiles">
          <TabsList className="w-full">
            <TabsTrigger
              value="external-profiles"
              className="flex-1"
              variant={TabVariant.SOCIAL}
            >
              External Profiles
            </TabsTrigger>
            <TabsTrigger
              value="comment-wall"
              className="flex-1"
              variant={TabVariant.SOCIAL}
              disabled
            >
              Comment Wall (coming soon)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="external-profiles">
            <ProfileExternalProfiles walletAddress={walletAddress} />
          </TabsContent>
          <TabsContent value="comment-wall">
            <Heading3>Jacques Chirac</Heading3>
            <Paragraph>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
              magnam facilis, esse repudiandae quasi cumque reiciendis odio
              voluptatum libero deleniti cupiditate est harum, maiores nam
              veritatis, omnis iusto voluptas eveniet.
            </Paragraph>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
