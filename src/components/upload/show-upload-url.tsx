'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/toast/toaster'
import { useToast } from '@/hooks/use-toast'
import { createURL } from './use-upload-media'

interface UploadUrlResponse {
  postUrl: string
  filename: string
  error?: string
}

export function ShowUploadUrl() {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadUrl, setUploadUrl] = useState<string>('')
  const [fileUrl, setFileUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const getUploadUrl = useCallback(
    async (file: File) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()

      if (isLoading) {
        console.log('Already loading, skipping request')
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const endpoint = `/api/upload/${encodeURIComponent(file.name)}`
        console.log('Requesting upload URL for:', file.name)

        const response = await fetch(endpoint, {
          method: 'POST',
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        })

        const data = (await response.json()) as UploadUrlResponse

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get upload URL')
        }

        if (!data.postUrl) {
          throw new Error('No upload URL returned from server')
        }

        setUploadUrl(data.postUrl)

        // Extract the domain and path from the pre-signed URL
        const url = new URL(data.postUrl)
        const bucketDomain = url.hostname
        const filePath = url.pathname.split('?')[0] // Remove query parameters

        // Construct the final file URL
        const finalFileUrl = createURL({
          domain: `https://${bucketDomain}`,
          endpoint: filePath,
        })

        setFileUrl(finalFileUrl)

        console.log('URLs generated successfully:', {
          filename: data.filename,
          uploadUrl: data.postUrl,
          fileUrl: finalFileUrl,
        })

        toast({
          title: 'Success',
          description: 'Upload URL generated successfully',
        })
      } catch (error) {
        // Don't show errors for aborted requests
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Request aborted')
          return
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to get upload URL'
        console.error('Error generating upload URL:', error)
        setError(errorMessage)
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'error',
        })
      } finally {
        setIsLoading(false)
        // Clear the abort controller
        abortControllerRef.current = null
      }
    },
    [toast],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        // Cancel any pending request when selecting a new file
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
          abortControllerRef.current = null
        }

        console.log('File selected:', {
          name: file.name,
          size: file.size,
          type: file.type,
        })
        setSelectedFile(file)
        setUploadUrl('')
        setFileUrl('')
        setError(null)
      }
    },
    [],
  )

  return (
    <>
      <div className="space-y-6 p-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Generate Upload URL</h2>
          <p className="text-sm text-gray-500">
            Select a file to generate its pre-signed upload URL
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="file"
            onChange={handleFileSelect}
            disabled={isLoading}
            className="block w-full text-sm text-green-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-900/30 file:text-green-400
              hover:file:bg-green-900/50
              file:cursor-pointer file:transition-colors
              file:border file:border-green-500
              disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {selectedFile && (
            <div className="space-y-2">
              <p className="text-sm">Selected file: {selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
                {selectedFile.type && ` • Type: ${selectedFile.type}`}
              </p>
              <Button
                onClick={() => getUploadUrl(selectedFile)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Generating URL...' : 'Generate Upload URL'}
              </Button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {uploadUrl && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Pre-signed Upload URL:</p>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm font-mono break-all">{uploadUrl}</p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(uploadUrl)
                    toast({
                      title: 'Copied',
                      description: 'Upload URL copied to clipboard',
                    })
                  }}
                  className="w-full"
                >
                  Copy Upload URL
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Final File URL (after upload):
                </p>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm font-mono break-all">{fileUrl}</p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(fileUrl)
                    toast({
                      title: 'Copied',
                      description: 'File URL copied to clipboard',
                    })
                  }}
                  className="w-full"
                >
                  Copy File URL
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </>
  )
}
