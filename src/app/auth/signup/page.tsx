'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    school: '',
    graduation_year: new Date().getFullYear(),
    country: ''
  })

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        name: formData.name,
        school: formData.school,
        graduation_year: formData.graduation_year,
        country: formData.country,
        profile_image: null
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Grade 9 Best Friends</h1>
          <p className="text-gray-600 mt-2">Never lose touch with your classmates</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            required
            className="w-full p-3 border rounded-lg"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-3 border rounded-lg"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            className="w-full p-3 border rounded-lg"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <input
            type="text"
            placeholder="School Name"
            required
            className="w-full p-3 border rounded-lg"
            value={formData.school}
            onChange={e => setFormData({...formData, school: e.target.value})}
          />
          <select
            className="w-full p-3 border rounded-lg"
            value={formData.graduation_year}
            onChange={e => setFormData({...formData, graduation_year: parseInt(e.target.value)})}
          >
            {Array.from({length: 6}, (_, i) => new Date().getFullYear() + i).map(year => (
              <option key={year} value={year}>Class of {year}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Country"
            required
            className="w-full p-3 border rounded-lg"
            value={formData.country}
            onChange={e => setFormData({...formData, country: e.target.value})}
          />

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up →'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-500">Login</a>
        </p>
      </div>
    </div>
  )
}
