'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ImageUpload from '@/components/ImageUpload'

interface CreatePostProps {
  userId: string
  groupId?: string
  onPostCreated: () => void
}

export default function CreatePost({ userId, groupId, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!content.trim() && !imageUrl) return
    
    setSubmitting(true)
    
    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      content: content.trim(),
      image_url: imageUrl || null,
      group_id: groupId || null
    })
    
    if (!error) {
      setContent('')
      setImageUrl('')
      onPostCreated()
    }
    
    setSubmitting(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <textarea
        placeholder={groupId ? "Share a memory with your group..." : "Share a memory..."}
        className="w-full p-3 border rounded-lg resize-none"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      
      {imageUrl && (
        <div className="mt-2 relative inline-block">
          <img src={imageUrl} alt="Preview" className="h-32 rounded" />
          <button
            onClick={() => setImageUrl('')}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="mt-3 flex gap-2">
        <ImageUpload 
          onUploadComplete={setImageUrl}
          buttonText="📷 Add Photo"
        />
        
        <button
          onClick={handleSubmit}
          disabled={submitting || (!content.trim() && !imageUrl)}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Memory'}
        </button>
      </div>
    </div>
  )
}
