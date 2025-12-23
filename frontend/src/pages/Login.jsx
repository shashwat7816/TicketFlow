import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login, user } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    if (user) nav('/')
  }, [user, nav])

  async function submit(e) {
    e.preventDefault()
    try {
      await login(email, password)
      nav('/')
    } catch (err) { setError(err.response?.data?.error || 'Login failed') }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="glass-panel p-10 w-full max-w-md relative z-10 border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Enter your details to access your account.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <input
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 focus:bg-black/40 transition-all text-white placeholder-gray-600"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs text-primary-400 hover:text-primary-300">Forgot?</a>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 focus:bg-black/40 transition-all text-white placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/20 transform hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create one now</Link>
        </p>
      </div>
    </div>
  )
}
