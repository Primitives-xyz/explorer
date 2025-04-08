'use client'

import { SubmitButton } from '@/components/form/submit-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DICEBEAR_API_BASE, DICEBEAR_AVATAR_STYLES } from '@/utils/constants'
import { cn } from '@/utils/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface DetailsStepProps {
  username: string
  bio: string
  setBio: (bio: string) => void
  selectedImageUrl: string
  fileUrl: string
  isUploadingImage: boolean
  suggestedBios: string[]
  suggestedImages: string[]
  handleImageSelect: (imageUrl: string) => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
  loadingNFTs?: boolean
}

export function DetailsStep({
  username,
  bio,
  setBio,
  selectedImageUrl,
  fileUrl,
  isUploadingImage,
  suggestedBios,
  suggestedImages,
  handleImageSelect,
  handleFileSelect,
  onBack,
  onSubmit,
  loading,
  loadingNFTs = false,
}: DetailsStepProps) {
  const [bioLength, setBioLength] = useState(0)
  const [showBioTooltip, setShowBioTooltip] = useState(false)
  const [activeTab, setActiveTab] = useState<'suggested' | 'upload'>(
    'suggested'
  )
  const [currentPage, setCurrentPage] = useState(1)
  const imagesPerPage = 8
  const [generatedAvatars, setGeneratedAvatars] = useState<string[]>([])

  useEffect(() => {
    setBioLength(bio.length)
  }, [bio])

  // Generate avatars from DiceBear API
  useEffect(() => {
    if (username) {
      const avatars = DICEBEAR_AVATAR_STYLES.map(
        (style) => `${DICEBEAR_API_BASE}/${style}/svg?seed=${username}`
      )
      setGeneratedAvatars(avatars)
    }
  }, [username])

  // Combine suggested images with generated avatars
  const allImages = [...suggestedImages, ...generatedAvatars]
  const totalPages = Math.ceil(allImages.length / imagesPerPage)
  const indexOfLastImage = currentPage * imagesPerPage
  const indexOfFirstImage = indexOfLastImage - imagesPerPage
  const currentImages = allImages.slice(indexOfFirstImage, indexOfLastImage)

  // Check if current page contains generated avatars
  const hasGeneratedAvatarsInCurrentPage = currentImages.some((img) =>
    generatedAvatars.includes(img)
  )
  const hasSuggestedImagesInCurrentPage = currentImages.some((img) =>
    suggestedImages.includes(img)
  )

  // We no longer need to show a default avatar separately since we have multiple generated avatars
  const showDefaultAvatar = false

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const PaginationControls = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-center gap-2 mt-3">
        <button
          type="button"
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className={`p-1 rounded-md ${
            currentPage === 1
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-green-400 hover:bg-green-900/30'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <span className="text-sm text-gray-300">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`p-1 rounded-md ${
            currentPage === totalPages
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-green-400 hover:bg-green-900/30'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-4 sm:space-y-2"
    >
      <div className="space-y-2 sm:space-y-3">
        <motion.h3
          className="text-lg sm:text-xl font-medium text-green-400 inline-flex items-center gap-2"
          variants={fadeIn}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 sm:w-6 sm:h-6"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
              clipRule="evenodd"
            />
          </svg>
          Personalize Your Profile
        </motion.h3>
        <motion.p
          className="text-base sm:text-lg text-gray-300"
          variants={fadeIn}
        >
          Add more details to make your profile stand out. You can add a bio and
          choose a profile image.
        </motion.p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-8">
        <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
          {/* Bio Section */}
          <motion.div
            className="space-y-3 sm:space-y-4 flex flex-col"
            variants={fadeIn}
          >
            <div className="space-y-2">
              <label
                htmlFor="bio"
                className="block text-base font-medium text-gray-200 flex justify-between"
              >
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-green-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 00-.75.75v.75c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-.75a.75.75 0 00-.75-.75H6z"
                      clipRule="evenodd"
                    />
                    <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 01-3 0V6.75z" />
                  </svg>
                  Bio <span className="text-gray-400 text-sm">(Optional)</span>
                </span>
                <span
                  className={`text-xs ${
                    bioLength > 250 ? 'text-red-400' : 'text-gray-400'
                  }`}
                >
                  {bioLength}/300
                </span>
              </label>
              <div className="relative">
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      setBio(e.target.value)
                    }
                  }}
                  name="bio"
                  placeholder="Tell us about yourself"
                  className={`w-full text-base py-2 sm:py-3 px-3 sm:px-4 bg-black/50 border border-green-500/30 focus:border-green-400 rounded-lg transition-all duration-200 min-h-[80px] sm:min-h-[120px] resize-none focus:ring-1 focus:ring-green-400/30 outline-hidden ${
                    !bio
                      ? 'placeholder:text-gray-400'
                      : 'placeholder:text-gray-500'
                  }`}
                  onFocus={() => setShowBioTooltip(true)}
                  onBlur={() => setShowBioTooltip(false)}
                  maxLength={300}
                  aria-describedby="bio-hint"
                />
                {!bio && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-500/30 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 sm:h-12 sm:w-12"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                <AnimatePresence>
                  {showBioTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute -bottom-12 left-0 right-0 bg-black/80 border border-green-500/30 p-2 rounded-md text-xs text-gray-300 z-10"
                      id="bio-hint"
                    >
                      Share your interests, experience, or anything that makes
                      you unique. Keep it under 300 characters.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {suggestedBios.length > 0 && (
              <motion.div
                className="space-y-2 sm:space-y-3 bg-black/30 rounded-xl p-3 sm:p-4 border border-green-500/20 flex-1"
                variants={fadeIn}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-medium text-green-400 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Suggested Bios
                  </h4>
                  <span className="text-sm text-gray-400 bg-black/50 px-2 py-1 rounded-md">
                    {suggestedBios.length} available
                  </span>
                </div>
                <motion.div
                  className="flex flex-col gap-2 max-h-[180px] sm:max-h-[240px] overflow-y-auto pr-2 custom-scrollbar"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {suggestedBios.map((suggestedBio, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      onClick={() => setBio(suggestedBio)}
                      variants={fadeIn}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`text-left p-2 sm:p-3 rounded-lg transition-all duration-200 text-xs sm:text-sm group relative
                        ${
                          bio === suggestedBio
                            ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                            : 'bg-black/50 text-white hover:bg-green-900/30 border border-green-500/20'
                        }`}
                    >
                      <div className="line-clamp-2">{suggestedBio}</div>
                      {suggestedBio.length > 150 && (
                        <div className="absolute left-0 right-0 -bottom-1 translate-y-full pt-2 hidden group-hover:block z-10">
                          <div className="bg-black/90 border border-green-800 rounded-lg p-3 shadow-xl">
                            <div className="text-xs text-gray-300">
                              {suggestedBio}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Profile Image Section */}
          <motion.div
            className="space-y-3 sm:space-y-4 flex flex-col md:col-span-2"
            variants={fadeIn}
          >
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="block text-sm sm:text-base font-medium text-gray-200 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-green-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Profile Image{' '}
                <span className="text-gray-400 text-sm">(Optional)</span>
              </label>

              {/* Preview Section - Fixed height container to prevent layout shifts */}
              <div className="h-[120px] sm:h-[160px] flex items-center justify-center">
                {selectedImageUrl || fileUrl ? (
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <div className="relative group">
                      <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-green-500 shadow-lg shadow-green-500/20">
                        <AvatarImage
                          src={selectedImageUrl || fileUrl}
                          alt="Profile preview"
                        />
                        <AvatarFallback className="bg-green-900/30 text-green-400 text-xl font-bold">
                          {username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white text-sm font-medium">
                          Selected
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-gray-400 text-sm">
                    No image selected yet
                  </div>
                )}
              </div>

              {/* Image Selection Tabs */}
              <div className="bg-black/30 rounded-xl border border-green-500/20 overflow-hidden flex-1 flex flex-col">
                <div className="flex border-b border-green-500/20">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('suggested')
                      setCurrentPage(1)
                    }}
                    className={`flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'suggested'
                        ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-black/50'
                    }`}
                  >
                    Suggested Images
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('upload')
                      setCurrentPage(1)
                    }}
                    className={`flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'upload'
                        ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-black/50'
                    }`}
                  >
                    Upload Image
                  </button>
                </div>

                <div className="p-3 sm:p-4 flex-1">
                  {activeTab === 'suggested' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="min-h-[180px] sm:min-h-[240px] flex flex-col"
                    >
                      {loadingNFTs ? (
                        <div className="flex justify-center items-center h-[200px]">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-green-400">
                              Loading your NFTs...
                            </p>
                          </div>
                        </div>
                      ) : suggestedImages.length > 0 ||
                        generatedAvatars.length > 0 ? (
                        <motion.div
                          className="flex flex-col"
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          layout
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm sm:text-base font-medium text-green-400 flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Available Images
                            </h4>
                            <span className="text-sm text-gray-400 bg-black/50 px-2 py-1 rounded-md">
                              {allImages.length} available
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center min-h-[200px] sm:min-h-[240px]">
                            {hasSuggestedImagesInCurrentPage &&
                              suggestedImages.length > 0 && (
                                <div className="w-full">
                                  <h5 className="text-sm font-medium text-green-400 mb-2">
                                    Your NFTs
                                  </h5>
                                </div>
                              )}
                            {currentImages
                              .filter((img) => suggestedImages.includes(img))
                              .map((imageUrl) => (
                                <motion.button
                                  key={imageUrl}
                                  type="button"
                                  onClick={() => handleImageSelect(imageUrl)}
                                  variants={fadeIn}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={cn(
                                    'relative group rounded-full overflow-hidden border-2 transition-all duration-200 w-[80px] h-[80px] sm:w-[96px] sm:h-[96px]',
                                    selectedImageUrl === imageUrl
                                      ? 'border-green-500 ring-2 ring-green-500/30'
                                      : 'border-green-500/20 hover:border-green-500/50'
                                  )}
                                >
                                  <Avatar className="w-full h-full">
                                    <AvatarImage
                                      src={imageUrl}
                                      alt="NFT profile"
                                    />
                                    <AvatarFallback className="bg-green-900/30 text-green-400">
                                      {username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-white font-medium">
                                      Select
                                    </span>
                                  </div>
                                </motion.button>
                              ))}

                            {hasGeneratedAvatarsInCurrentPage && (
                              <div className="w-full">
                                <h5 className="text-sm font-medium text-green-400 mb-2 mt-4">
                                  Generated Avatars
                                </h5>
                              </div>
                            )}
                            {currentImages
                              .filter((img) => generatedAvatars.includes(img))
                              .map((imageUrl) => (
                                <motion.button
                                  key={imageUrl}
                                  type="button"
                                  onClick={() => handleImageSelect(imageUrl)}
                                  variants={fadeIn}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={cn(
                                    'relative group rounded-full overflow-hidden border-2 transition-all duration-200 w-[80px] h-[80px] sm:w-[96px] sm:h-[96px]',
                                    selectedImageUrl === imageUrl
                                      ? 'border-green-500 ring-2 ring-green-500/30'
                                      : 'border-green-500/20 hover:border-green-500/50'
                                  )}
                                >
                                  <Avatar className="w-full h-full">
                                    <AvatarImage
                                      src={imageUrl}
                                      alt="Generated avatar"
                                    />
                                    <AvatarFallback className="bg-green-900/30 text-green-400">
                                      {username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-white font-medium">
                                      {imageUrl.split('/')[4]} style
                                    </span>
                                  </div>
                                </motion.button>
                              ))}
                          </div>
                          <PaginationControls />
                        </motion.div>
                      ) : (
                        <div className="flex justify-center h-[200px] items-center">
                          <div className="text-center text-gray-400">
                            <p className="mb-2">No images available</p>
                            <p className="text-sm">
                              Try uploading your own image
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'upload' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 min-h-[240px]"
                    >
                      <div className="bg-black/30 rounded-lg p-3 sm:p-4 border border-green-500/20">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className={`flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer 
                              ${
                                isUploadingImage
                                  ? 'border-gray-600 bg-black/20'
                                  : 'border-green-500/30 bg-black/30 hover:bg-black/50 hover:border-green-500/50'
                              } transition-all duration-200`}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className={`w-8 h-8 mb-3 ${
                                  isUploadingImage
                                    ? 'text-gray-500'
                                    : 'text-green-400'
                                }`}
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 16"
                              >
                                <path
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                />
                              </svg>
                              <p className="mb-2 text-sm text-gray-300">
                                <span className="font-medium">
                                  Click to upload
                                </span>{' '}
                                or drag and drop
                              </p>
                              <p className="text-xs text-gray-400">
                                PNG, JPG or GIF (MAX. 2MB)
                              </p>
                            </div>
                            <input
                              id="dropzone-file"
                              type="file"
                              onChange={handleFileSelect}
                              accept="image/*"
                              disabled={isUploadingImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {isUploadingImage && (
                          <div className="flex items-center gap-2 mt-3 text-green-400">
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Uploading image...</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="flex gap-2 sm:gap-4 " variants={fadeIn}>
          <button
            type="button"
            onClick={onBack}
            className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-black/50 
              hover:bg-green-900/30 rounded-lg transition-all duration-200 border border-green-500/20
              hover:border-green-500/40 focus:outline-hidden focus:ring-2 focus:ring-green-500/20"
            aria-label="Go back to previous step"
          >
            <span className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </span>
          </button>
          <SubmitButton
            disabled={loading || isUploadingImage}
            className="flex-1 py-3 sm:py-4 text-base sm:text-lg font-medium bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-black transition-all duration-200 rounded-lg shadow-lg shadow-green-500/10 focus:outline-hidden focus:ring-2 focus:ring-green-500/50"
          >
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  Create Profile
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a.75.75 0 01.75.75v12.59l1.95-2.1a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 111.1-1.02l1.95 2.1V2.75A.75.75 0 0110 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </span>
          </SubmitButton>
        </motion.div>
      </form>
    </motion.div>
  )
}
