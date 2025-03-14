import {
  Button,
  ButtonVariant,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Paragraph,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components-new-version/ui'
import { Badge } from '@/components-new-version/ui/badge'

export default function DesignSystem() {
  return (
    <div className="p-20 space-y-5 bg-background min-h-screen">
      <div className="space-y-5">
        <Heading1>The quick brown fox jumps over the lazy dog.</Heading1>
        <Heading2>The quick brown fox jumps over the lazy dog.</Heading2>
        <Heading3>The quick brown fox jumps over the lazy dog.</Heading3>
        <Heading4>The quick brown fox jumps over the lazy dog.</Heading4>
        <Paragraph>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni alias,
          neque sed mollitia quo porro dolores soluta repudiandae delectus
          placeat atque nobis quas. Sunt quidem iste laborum id, soluta
          deserunt?
        </Paragraph>
      </div>
      <div className="flex flex-col items-start gap-3">
        <Button variant={ButtonVariant.DEFAULT} className="w-[150px]">
          Default
        </Button>
        <Button variant={ButtonVariant.OUTLINE} className="w-[150px]">
          Outline
        </Button>
        <Button variant={ButtonVariant.GHOST} className="w-[150px]">
          Ghost
        </Button>
        <Button variant={ButtonVariant.SECONDARY} className="w-[150px]">
          Secondary
        </Button>
        <Button variant={ButtonVariant.OUTLINE_WHITE} className="w-[150px]">
          Outline white
        </Button>
      </div>
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
      <div>
        <Badge>25%</Badge>
      </div>
    </div>
  )
}
