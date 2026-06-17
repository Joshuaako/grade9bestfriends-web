'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ImageUpload from '@/components/ImageUpload'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    name: '',
    school: '',
    graduation_year: new Date().getFullYear(),
    country: '',
    profile_image: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUserAndProfile()
  }, [])

  async function loadUserAndProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setProfile(data)
    }
  }

  async function handleProfilePhotoUpload(url: string) {
    if (!user) return
    
    const { error } = await supabase
      .from('users')
      .update({ profile_image: url })
      .eq('id', user.id)
    
    if (!error) {
      setProfile({ ...profile, profile_image: url })
      setMessage('Profile photo updated!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase
      .from('users')
      .update({
        name: profile.name,
        school: profile.school,
        graduation_year: profile.graduation_year,
        country: profile.country
      })
      .eq('id', user.id)
    
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Profile updated!')
      setTimeout(() => setMessage(''), 3000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {message}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img 
              src={profile.profile_image || '/default-avatar.png'} 
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
            />
          </div>
          
          <div className="mt-4">
            <ImageUpload 
              onUploadComplete={handleProfilePhotoUpload}
              bucketName="profile-photos"
              folder="avatars"
              buttonText="Change Profile Photo"
            />
          </div>
        </div>
        
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">School</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={profile.school}
              onChange={e => setProfile({...profile, school: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Graduation Year</label>
            <select
              className="w-full p-2 border rounded"
              value={profile.graduation_year}
              onChange={e => setProfile({...profile, graduation_year: parseInt(e.target.value)})}
            >
              {Array.from({length: 6}, (_, i) => new Date().getFullYear() + i).map(year => (
                <option key={year} value={year}>Class of {year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded"
              value={profile.country}
              onChange={e => setProfile({...profile, country: e.target.value})}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
