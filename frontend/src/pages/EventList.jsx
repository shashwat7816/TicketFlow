import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function EventList() {
  const [events, setEvents] = useState([])
  const { user } = useAuth()

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'seated', 'general'

  useEffect(() => {
    axios.get(import.meta.env.VITE_API_URL + '/api/events')
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
  }, [])

  // Filter Logic
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || e.eventType === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 mb-16 shadow-2xl shadow-indigo-500/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative p-12 md:p-20 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Discover Your Next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">Unforgettable Experience</span>
          </h1>
          <p className="text-white/80 text-xl md:text-2xl max-w-2xl mx-auto mb-10 font-light">
            Book seats, buy tickets, and create memories with TicketFlow.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col md:flex-row gap-2">
            <div className="flex-grow relative">
              <svg className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Search events, venues..."
                className="w-full bg-black/20 text-white placeholder-white/50 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:bg-black/30 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative min-w-[150px]">
              <select
                className="w-full bg-black/20 text-white rounded-xl py-3 px-4 focus:outline-none focus:bg-black/30 appearance-none cursor-pointer"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all" className="bg-gray-800">All Types</option>
                <option value="seated" className="bg-gray-800">Seated</option>
                <option value="general" className="bg-gray-800">General</option>
              </select>
              <svg className="w-4 h-4 absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map(e => (
          <div key={e._id} className="group glass-panel rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-primary-900/20 flex flex-col h-full border border-white/5 hover:border-primary-500/30">
            <div className="h-56 relative overflow-hidden bg-dark-bg">
              {e.bannerUrl ? (
                <img src={e.bannerUrl} alt={e.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <span className="text-gray-700 font-bold text-4xl select-none opacity-20 group-hover:opacity-50 transition-opacity">Event</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  {e.eventType === 'seated' ? (
                    <><span className="w-2 h-2 rounded-full bg-blue-400"></span> Seated</>
                  ) : (
                    <><span className="w-2 h-2 rounded-full bg-green-400"></span> General</>
                  )}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-grow relative">
              {/* Date Badge floating on overlap */}
              <div className="absolute -top-6 left-6 bg-dark-card border border-white/10 rounded-lg p-2 text-center min-w-[60px] shadow-lg">
                <div className="text-xs text-primary-400 font-bold uppercase">{new Date(e.date).toLocaleString('default', { month: 'short' })}</div>
                <div className="text-xl text-white font-black">{new Date(e.date).getDate()}</div>
              </div>

              <div className="mt-4 mb-4">
                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-primary-400 transition-colors h-14 overflow-hidden">{e.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{e.description}</p>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {e.venue}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Link to={`/events/${e._id}`} className="flex-1 text-center bg-white/5 hover:bg-white/10 hover:text-primary-400 text-white font-medium py-2 rounded-lg border border-white/5 transition-all">
                  Get Tickets
                </Link>
                {user && user.id === e.createdBy && (
                  <Link to={`/events/${e._id}/edit`} className="px-3 flex items-center justify-center bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/20 rounded-lg transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500 bg-white/5 rounded-2xl border border-white/5 border-dashed">
            <p className="text-xl mb-4">No events found matching your criteria.</p>
            <button onClick={() => { setSearchTerm(''); setFilterType('all') }} className="text-primary-400 hover:underline">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  )
}
