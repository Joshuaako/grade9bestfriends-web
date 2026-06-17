'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function PostCard({ post, currentUserId }: { post: any, currentUserId: string }) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    if (showComments) {
      fetchComments()
    }
  }, [showComments])

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*, users(name)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  async function addComment() {
    if (!newComment.trim()) return
    
    await supabase.from('comments').insert({
      post_id: post.id,
      user_id: currentUserId,
      content: newComment
    })
    
    setNewComment('')
    fetchComments()
  }

  return (
    <div className="bg-white rounded-lg shadow mb-4 p-4">
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={post.users?.profile_image || '/default-avatar.png'} 
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold">{post.users?.name}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <p className="text-gray-800 mb-3">{post.content}</p>
      
      {post.image_url && (
        <img 
          src={post.image_url} 
          alt="Memory" 
          className="rounded-lg max-h-96 w-full object-cover mb-3"
        />
      )}
      
      <div className="flex gap-4 text-sm text-gray-500">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="hover:text-blue-500"
        >
          💬 {comments.length} Comments
        </button>
      </div>
      
      {showComments && (
        <div className="mt-3 pt-3 border-t">
          {comments.map((comment: any) => (
            <div key={comment.id} className="mb-2 text-sm">
              <span className="font-semibold">{comment.users?.name}: </span>
              {comment.content}
            </div>
          ))}
          
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 p-2 border rounded text-sm"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
            />
            <button 
              onClick={addComment}
              className="bg-gray-100 px-3 py-1 rounded text-sm"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
