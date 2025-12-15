import React, { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'

export default function App() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  async function handleLogout() {
    await logout()
    nav('/login')
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans selection:bg-primary-500/30 flex flex-col">
      <header className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl bg-dark-bg/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => nav('/')}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-primary-500/20">
                <span className="text-xl">🎟️</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent group-hover:to-white transition-all">
                TicketFlow
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group">
                Events
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
              </Link>
              {user ? (
                <>
                  <Link to="/my-tickets" className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group">
                    My Tickets
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
                  </Link>
                  <Link to="/create-event" className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group">
                    Host Event
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
                  </Link>
                  {user.roles?.includes('admin') && (
                    <Link to="/admin" className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">Admin</Link>
                  )}
                  <div className="flex items-center gap-4 pl-8 border-l border-white/10">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">Welcome back</span>
                      <span className="text-sm font-bold text-white">{user.name}</span>
                    </div>
                    <button onClick={handleLogout} className="text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-all hover:border-white/20">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Log in</Link>
                  <Link to="/register" className="text-sm font-bold bg-white text-black px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5">
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow pb-20">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-lg mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-sm">🎟️</span>
              </div>
              <span className="text-xl font-bold text-white">TicketFlow</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              The easiest way to find and book tickets for your favorite events. Secure, fast, and beautiful.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-primary-400 transition-colors">Browse Events</Link></li>
              <li><Link to="/create-event" className="hover:text-primary-400 transition-colors">Host an Event</Link></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 w-full" />
              <button className="bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-4 py-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8 border-t border-white/5 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} TicketFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
