import {
  Button,
  ButtonVariant,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Paragraph,
} from '@/components-new-version/ui'

export default function DesignSystem() {
  return (
    <div className="p-20 space-y-5">
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
          Default Button
        </Button>
        <Button variant={ButtonVariant.OUTLINE} className="w-[150px]">
          Outline Button
        </Button>
        <Button variant={ButtonVariant.GHOST} className="w-[150px]">
          Ghost Button
        </Button>
      </div>
    </div>
  )
}
