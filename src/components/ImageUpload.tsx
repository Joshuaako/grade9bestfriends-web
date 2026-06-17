'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  bucketName?: string
  folder?: string
  buttonText?: string
}

export default function ImageUpload({ 
  onUploadComplete, 
  bucketName = 'post-images',
  folder = 'memories',
  buttonText = 'Upload Photo'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError('')

    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB.')
      setUploading(false)
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      setUploading(false)
      return
    }

    const filename = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename)

    onUploadComplete(publicUrl)
    setUploading(false)
  }

  const removeImage = () => {
    setPreview(null)
    onUploadComplete('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {preview && (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-w-full h-48 rounded-lg object-cover border"
          />
          <button
            onClick={removeImage}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          {buttonText}
        </label>
        
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            Uploading...
          </div>
        )}
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  )
}
