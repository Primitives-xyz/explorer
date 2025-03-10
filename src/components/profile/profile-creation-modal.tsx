import { Modal } from '@/components/common/modal'
import { useTranslations } from 'next-intl'

interface ProfileCreationModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ProfileCreationModal = ({
  isOpen,
  onClose,
}: ProfileCreationModalProps) => {
  const t = useTranslations()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('profile_info.create_new_profile')}
    >
      <div className="flex flex-col gap-3">
        <button
          onClick={() =>
            window.open('https://www.dotblink.me/search', '_blank')
          }
          className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
        >
          {t('profile_info.create_a_blink_profile')}
        </button>
        <button
          onClick={() => window.open('https://www.sns.id/', '_blank')}
          className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
        >
          {t('profile_info.create_a_sol_profile')}
        </button>
        <button
          onClick={() =>
            window.open('https://alldomains.id/buy-domain', '_blank')
          }
          className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
        >
          {t('profile_info.explore_all_domains')}
        </button>
      </div>
    </Modal>
  )
}
