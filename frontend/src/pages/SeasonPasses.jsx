import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Check, Star, ShieldCheck } from 'lucide-react'

export default function SeasonPasses() {
    const { api, user } = useAuth()
    const [types, setTypes] = useState([])
    const [myPasses, setMyPasses] = useState([])
    const [buying, setBuying] = useState(null)

    useEffect(() => {
        loadTypes()
        if (user) loadMyPasses()
    }, [user])

    async function loadTypes() {
        try {
            const res = await api.get('/api/passes/types')
            setTypes(res.data)
        } catch (e) { console.error(e) }
    }

    async function loadMyPasses() {
        try {
            const res = await api.get('/api/passes/mine')
            setMyPasses(res.data)
        } catch (e) { console.error(e) }
    }

    async function buyPass(typeId) {
        if (!user) return alert('Please login to purchase')
        if (!window.confirm('Confirm purchase?')) return

        setBuying(typeId)
        try {
            await api.post('/api/passes/purchase', { passTypeId: typeId })
            alert('Purchase successful!')
            loadMyPasses()
        } catch (e) {
            alert('Failed: ' + (e.response?.data?.error || e.message))
        } finally {
            setBuying(null)
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Unlock Exclusive Access</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Get a Season Pass and enjoy seamless entry to the best events. No booking fees, priority access, and more.
                </p>
            </div>

            {/* My Passes */}
            {user && myPasses.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" /> Your Active Passes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myPasses.map(pass => (
                            <div key={pass._id} className="glass-panel p-6 border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Star size={100} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{pass.passTypeId?.name}</h3>
                                <p className="text-emerald-400 uppercase tracking-widest text-xs font-bold mb-4">{pass.status}</p>

                                <div className="space-y-2 text-sm text-gray-300">
                                    <p>Expires: {new Date(pass.expiryDate).toLocaleDateString()}</p>
                                    {pass.passTypeId?.type === 'credits' && (
                                        <p>Credits Remaining: <span className="font-bold text-white">{pass.remainingCredits}</span></p>
                                    )}
                                    {pass.passTypeId?.type === 'unlimited' && (
                                        <p>Unlimited Access</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Passes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {types.map(t => (
                    <div key={t._id} className="glass-panel p-8 flex flex-col hover:border-primary-500/50 transition-all hover:-translate-y-2 relative group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-t-xl group-hover:h-2 transition-all"></div>
                        <h3 className="text-2xl font-bold text-white mb-2">{t.name}</h3>
                        <p className="text-gra-400 h-12 mb-6 text-sm">{t.description}</p>

                        <div className="text-4xl font-black text-white mb-2">${t.price}</div>
                        <p className="text-primary-400 text-sm font-medium mb-8">Valid for {t.durationDays} days</p>

                        <div className="space-y-3 mb-8 flex-grow">
                            <div className="flex items-center gap-2 text-gray-300">
                                <Check size={16} className="text-green-400" />
                                {t.type === 'unlimited' ? 'Unlimited Events' : `${t.credits} Event Credits`}
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                                <Check size={16} className="text-green-400" />
                                Priority Booking
                            </div>
                        </div>

                        <button
                            onClick={() => buyPass(t._id)}
                            disabled={buying === t._id}
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {buying === t._id ? 'Processing...' : 'Get Access'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
