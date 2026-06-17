'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import CreatePost from '@/components/CreatePost'
import PostCard from '@/components/PostCard'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchPosts()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
    setLoading(false)
  }

  async function fetchPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, users(name, profile_image)')
      .is('group_id', null)
      .order('created_at', { ascending: false })
      .limit(20)
    setPosts(data || [])
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Memories</h1>
      
      <CreatePost 
        userId={user?.id} 
        onPostCreated={fetchPosts}
      />
      
      {posts.map(post => (
        <PostCard key={post.id} post={post} currentUserId={user?.id} />
      ))}
      
      {posts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No posts yet. Be the first to share a memory!
        </div>
      )}
    </div>
  )
}
