'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndLoadGroup()
  }, [])

  async function checkAuthAndLoadGroup() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)

    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('id', params.groupId)
      .single()
    
    setGroup(groupData)
    setLoading(false)
  }

  async function acceptInvite() {
    if (!currentUser) {
      router.push(`/auth/signup?redirect=/invite/${params.groupId}`)
      return
    }

    const { data: existing } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', params.groupId)
      .eq('user_id', currentUser.id)
      .single()

    if (existing) {
      router.push(`/groups/${params.groupId}`)
      return
    }

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: params.groupId,
        user_id: currentUser.id,
        role: 'member'
      })

    if (!error) {
      router.push(`/groups/${params.groupId}`)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!group) return <div className="p-8 text-center">Group not found</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h1 className="text-2xl font-bold">Join {group.name}</h1>
          <p className="text-gray-600 mt-2">
            Stay connected with your Grade 9 friends forever
          </p>
        </div>

        <button
          onClick={acceptInvite}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
        >
          {currentUser ? 'Join Group →' : 'Sign Up to Join →'}
        </button>

        {!currentUser && (
          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <a href={`/auth/login?redirect=/invite/${params.groupId}`} className="text-blue-500">
              Login
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
