import { useState } from 'react'
import { useFileUpload } from './use-file-upload'

type FormStep = 'username' | 'details'

interface UseProfileFormReturn {
  username: string
  bio: string
  currentStep: FormStep
  selectedImageUrl: string
  fileUrl: string
  isUploadingImage: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSuggestedUsernameClick: (suggestedUsername: string) => void
  handleImageSelect: (imageUrl: string) => void
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  setCurrentStep: (step: FormStep) => void
  setBio: (bio: string) => void
  resetForm: () => void
}

export function useProfileForm(initialUsername = ''): UseProfileFormReturn {
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState('')
  const [currentStep, setCurrentStep] = useState<FormStep>('username')
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
  const { fileUrl, isUploading: isUploadingImage, uploadFile } = useFileUpload()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const validValue = value.toLowerCase().replace(/[^a-z0-9]/g, '')
    setUsername(validValue)
  }

  const handleSuggestedUsernameClick = (suggestedUsername: string) => {
    setUsername(suggestedUsername)
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const uploadedUrl = await uploadFile(file)
        setSelectedImageUrl(uploadedUrl)
      } catch (err) {
        console.error('Error uploading file:', err)
      }
    }
  }

  const resetForm = () => {
    setUsername(initialUsername)
    setBio('')
    setCurrentStep('username')
    setSelectedImageUrl('')
  }

  return {
    username,
    bio,
    currentStep,
    selectedImageUrl,
    fileUrl,
    isUploadingImage,
    handleInputChange,
    handleSuggestedUsernameClick,
    handleImageSelect,
    handleFileSelect,
    setCurrentStep,
    setBio,
    resetForm,
  }
}
