import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components-new-version/common/right-sidebar-wrapper'
import {
  Badge,
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Paragraph,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components-new-version/ui'
import { Toggle } from '@/components-new-version/ui/switch/toggle'
import { FormMockup } from './form-mockup'

export default function DesignSystem() {
  return (
    <>
      <MainContentWrapper className="min-w-main-content max-w-main-content mx-auto pb-12">
        <div className="space-y-5">
          <Heading1>The quick brown fox jumps over the lazy dog.</Heading1>
          <Heading2>The quick brown fox jumps over the lazy dog.</Heading2>
          <Heading3>The quick brown fox jumps over the lazy dog.</Heading3>
          <Heading4>The quick brown fox jumps over the lazy dog.</Heading4>
          <Paragraph>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni
            alias, neque sed mollitia quo porro dolores soluta repudiandae
            delectus placeat atque nobis quas. Sunt quidem iste laborum id,
            soluta deserunt?
          </Paragraph>
        </div>
        <Separator />
        <div className="grid grid-cols-2">
          <div className="flex flex-col items-center gap-3">
            <Button variant={ButtonVariant.DEFAULT} className="w-[150px]">
              Default
            </Button>
            <Button variant={ButtonVariant.SECONDARY} className="w-[150px]">
              Secondary
            </Button>
            <Button variant={ButtonVariant.OUTLINE} className="w-[150px]">
              Outline
            </Button>
            <Button variant={ButtonVariant.OUTLINE_WHITE} className="w-[150px]">
              Outline white
            </Button>
            <Button variant={ButtonVariant.GHOST} className="w-[150px]">
              Ghost
            </Button>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Button
              variant={ButtonVariant.DEFAULT_SOCIAL}
              className="w-[150px]"
            >
              Default
            </Button>
            <Button
              variant={ButtonVariant.SECONDARY_SOCIAL}
              className="w-[150px]"
            >
              Secondary
            </Button>
            <Button
              variant={ButtonVariant.OUTLINE_SOCIAL}
              className="w-[150px]"
            >
              Outline
            </Button>
          </div>
        </div>
        <Separator />
        <div>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Chuck Norris</TabsTrigger>
              <TabsTrigger value="tab2">Jacques Chirac</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <Heading3>Chuck Norris</Heading3>
              <Paragraph>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
                magnam facilis, esse repudiandae quasi cumque reiciendis odio
                voluptatum libero deleniti cupiditate est harum, maiores nam
                veritatis, omnis iusto voluptas eveniet.
              </Paragraph>
            </TabsContent>
            <TabsContent value="tab2">
              <Heading3>Jacques Chirac</Heading3>
              <Paragraph>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
                magnam facilis, esse repudiandae quasi cumque reiciendis odio
                voluptatum libero deleniti cupiditate est harum, maiores nam
                veritatis, omnis iusto voluptas eveniet.
              </Paragraph>
            </TabsContent>
          </Tabs>
        </div>
        <Separator />
        <div>
          <Badge>25%</Badge>
        </div>
        <Separator />
        <div className="max-w-xs">
          <FormMockup />
        </div>
        <Separator />
        <div>
          <Toggle />
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Deploy your new project in one-click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Paragraph className="text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Molestias quia aliquid officia tenetur reprehenderit. Sunt dolor
                id porro quae fugiat, atque ratione voluptatibus placeat dolorem
                earum quam dignissimos commodi eius!
              </Paragraph>
            </CardContent>
          </Card>
          <Card className="background-gradient-card">
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Deploy your new project in one-click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Paragraph className="text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Molestias quia aliquid officia tenetur reprehenderit. Sunt dolor
                id porro quae fugiat, atque ratione voluptatibus placeat dolorem
                earum quam dignissimos commodi eius!
              </Paragraph>
            </CardContent>
          </Card>
        </div>
      </MainContentWrapper>
      <RightSidebarWrapper>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Consequatur,
        voluptatum! Ea, quisquam sed. Ipsam delectus tenetur adipisci,
        cupiditate ratione dolore officiis soluta ducimus placeat porro libero
        repellat cum facilis reiciendis.
      </RightSidebarWrapper>
    </>
  )
}
