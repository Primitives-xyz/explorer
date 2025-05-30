import { Checkbox, Label } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { CheckboxSize } from '@/components/ui/switch/checkbox.models'
import { useCurrentWallet } from '@/utils/use-current-wallet'

export function PudgyAvatarFrameSelection() {
  const { mainProfile } = useCurrentWallet()

  if (!mainProfile) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border-4 border-pudgy-border rounded-full">
        <Avatar
          username={mainProfile.username}
          imageUrl={mainProfile.image}
          className="w-40"
          size={160}
        />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="add_pudgy_profile_frame"
          // checked={useSSEForFees}
          // onClick={() => setUseSSEForFees(!useSSEForFees)}
          size={CheckboxSize.LG}
        />
        <Label htmlFor="add_pudgy_profile_frame" className="font-bold">
          Add Pudgy Profile Frame
        </Label>
      </div>
    </div>
  )
}
