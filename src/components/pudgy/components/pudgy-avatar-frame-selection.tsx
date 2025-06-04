import { Checkbox, Label } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { CheckboxSize } from '@/components/ui/switch/checkbox.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface Props {
  displayPudgyFrame: boolean
  setDisplayPudgyFrame: (displayPudgyFrame: boolean) => void
}

export function PudgyAvatarFrameSelection({
  displayPudgyFrame,
  setDisplayPudgyFrame,
}: Props) {
  const { mainProfile } = useCurrentWallet()

  if (!mainProfile) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar
        username={mainProfile.username}
        imageUrl={mainProfile.image}
        className="w-40"
        size={160}
        displayPudgyFrame={displayPudgyFrame}
      />
      <div className="flex items-center gap-2">
        <Checkbox
          id="add_pudgy_profile_frame"
          checked={displayPudgyFrame}
          onClick={() => setDisplayPudgyFrame(!displayPudgyFrame)}
          size={CheckboxSize.LG}
        />
        <Label htmlFor="add_pudgy_profile_frame" className="font-bold">
          Add Pudgy Profile Frame
        </Label>
      </div>
    </div>
  )
}
