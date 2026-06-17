'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import CreatePost from '@/components/CreatePost'
import PostCard from '@/components/PostCard'

export default function GroupPage() {
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<any>(null)
  const [posts, setPosts] = useState([])
  const [members, setMembers] = useState([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [inviteLink, setInviteLink] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.id])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setCurrentUser(user)

    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('id', params.id)
      .single()
    setGroup(groupData)

    const { data: membership } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .single()
    
    setIsMember(!!membership)

    if (membership) {
      loadPosts()
      loadMembers()
    }

    setInviteLink(`${window.location.origin}/invite/${params.id}`)
  }

  async function loadPosts() {
    const { data } = await supabase
      .from('posts')
      .select('*, users(name, profile_image)')
      .eq('group_id', params.id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  async function loadMembers() {
    const { data } = await supabase
      .from('group_members')
      .select('*, users(name, profile_image)')
      .eq('group_id', params.id)
    setMembers(data || [])
  }

  async function joinGroup() {
    if (!currentUser) return

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: params.id,
        user_id: currentUser.id,
        role: 'member'
      })
    
    if (!error) {
      setIsMember(true)
      loadPosts()
      loadMembers()
    }
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    alert('Invite link copied!')
  }

  if (!group) return <div className="p-4">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-gray-600 mt-1">{group.description || 'Share memories from Grade 9!'}</p>
            <p className="text-sm text-gray-500 mt-2">{members.length} members</p>
          </div>
          
          {isMember && (
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Invite Friends
            </button>
          )}
        </div>

        {showInvite && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <p className="font-semibold mb-2">Share this link with friends:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 p-2 border rounded bg-white"
              />
              <button
                onClick={copyInviteLink}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {!isMember ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="mb-4">You're not a member of this group yet.</p>
          <button
            onClick={joinGroup}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Join this Group
          </button>
        </div>
      ) : (
        <>
          <CreatePost 
            userId={currentUser?.id} 
            groupId={params.id}
            onPostCreated={loadPosts}
          />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Group Memories</h2>
            {posts.map(post => (
              <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
            ))}
            {posts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No posts yet. Be the first to share a memory!
              </div>
            )}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {members.map((member: any) => (
                <div key={member.user_id} className="flex items-center gap-2 p-2 border rounded">
                  <img 
                    src={member.users?.profile_image || '/default-avatar.png'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-medium">{member.users?.name}</span>
                  {member.role === 'admin' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
