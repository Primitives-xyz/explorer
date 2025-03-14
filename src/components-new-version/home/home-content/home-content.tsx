import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { Summary } from '@/components-new-version/home/home-content/summary'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'

export function HomeContent() {
  enum LeaderboardTypeTabs {
    GLOBAL = 'following',
    FRIENDS = 'twitter KOLs',
  }
  return (
    <OverflowContentWrapper>
      <Summary />
      {/* <Tabs defaultValue={LeaderboardTypeTabs.GLOBAL}>
        <div className="px-5">
          <TabsList className="w-full">
            <TabsTrigger value={LeaderboardTypeTabs.GLOBAL} className="w-full">
              Global
            </TabsTrigger>
            <TabsTrigger value={LeaderboardTypeTabs.FRIENDS} className="w-full">
              Friends
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={LeaderboardTypeTabs.GLOBAL}></TabsContent>
        <TabsContent value={LeaderboardTypeTabs.FRIENDS}></TabsContent>
      </Tabs> */}

      <Card>
        <CardHeader>
          <CardTitle>Main Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>Content {i + 1}</CardTitle>
                </CardHeader>
                <CardContent>Scrollable content</CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </OverflowContentWrapper>
  )
}
