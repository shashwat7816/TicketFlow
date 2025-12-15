import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const { register } = useAuth()
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    try {
      await register(email, password, name)
      nav('/')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-panel p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">Create Account</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-dark-bg/50 border border-primary-900/30 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-colors text-white"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-dark-bg/50 border border-primary-900/30 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-colors text-white"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-dark-bg/50 border border-primary-900/30 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-colors text-white"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 rounded-lg transition-all shadow-lg hover:shadow-primary-500/25"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
