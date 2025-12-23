import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Check, Star, ShieldCheck } from 'lucide-react'

export default function SeasonPasses() {
    const { api, user } = useAuth()
    const [types, setTypes] = useState([])
    const [myPasses, setMyPasses] = useState([])
    const [buying, setBuying] = useState(null)
    const [confirming, setConfirming] = useState(null)
    const [modal, setModal] = useState({ show: false, title: '', message: '', type: 'success' })

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

    // Phase 1: Confirmation
    function requestPurchase(type) {
        if (!user) {
            setModal({ show: true, title: 'Login Required', message: 'Please login to purchase a membership.', type: 'error' })
            return
        }
        setConfirming(type)
    }

    // Phase 2: Execution
    async function confirmPurchase() {
        if (!confirming) return
        const typeId = confirming._id
        setConfirming(null)
        setBuying(typeId)

        try {
            await api.post('/api/passes/purchase', { passTypeId: typeId })
            setModal({ show: true, title: 'Purchase Successful!', message: 'You have successfully unlocked exclusive access.', type: 'success' })
            loadMyPasses()
        } catch (e) {
            setModal({ show: true, title: 'Purchase Failed', message: e.response?.data?.error || e.message, type: 'error' })
        } finally {
            setBuying(null)
        }
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 relative">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6">Unlock Exclusive Access</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Get a Season Pass and enjoy seamless entry to the best events. No booking fees, priority access, and more.
                </p>
            </div>

            {/* My Passes */}
            {user && myPasses.length > 0 && (
                <div className="mb-16 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" /> Your Active Passes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myPasses.map(pass => (
                            <div key={pass._id} className="glass-panel p-6 border border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
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
                {types.map(t => {
                    const isOwned = myPasses.some(p => p.passTypeId._id === t._id && p.status === 'active' && new Date(p.expiryDate) > new Date())

                    return (
                        <div key={t._id} className={`glass-panel p-8 flex flex-col transition-all relative group ${isOwned ? 'border-emerald-500/30 bg-emerald-500/5' : 'hover:border-primary-500/50 hover:-translate-y-2'}`}>
                            <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl transition-all ${isOwned ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-purple-600 group-hover:h-2'}`}></div>
                            <h3 className="text-2xl font-bold text-white mb-2">{t.name}</h3>
                            <p className="text-gray-400 h-12 mb-6 text-sm">{t.description}</p>

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
                                onClick={() => requestPurchase(t)}
                                disabled={buying === t._id || isOwned}
                                className={`w-full font-bold py-3 rounded-xl transition-all shadow-lg ${isOwned
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                                    : 'bg-white text-black hover:bg-gray-200 active:scale-95 hover:shadow-white/20'
                                    } disabled:opacity-50 disabled:scale-100`}
                            >
                                {buying === t._id ? 'Processing...' : isOwned ? 'Active' : 'Get Access'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Confirmation Modal */}
            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-dark-bg border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative">
                        <h3 className="text-2xl font-bold text-white mb-2">Confirm Purchase</h3>
                        <p className="text-gray-400 mb-6">
                            Are you sure you want to buy the <strong className="text-white">{confirming.name}</strong> for <strong className="text-white">${confirming.price}</strong>?
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setConfirming(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all">
                                Cancel
                            </button>
                            <button onClick={confirmPurchase} className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-900/20">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {modal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-dark-bg border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl relative text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modal.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {modal.type === 'success' ? <Check size={32} strokeWidth={3} /> : <span className="text-3xl">!</span>}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{modal.title}</h3>
                        <p className="text-gray-400 mb-6">{modal.message}</p>
                        <button onClick={() => setModal({ ...modal, show: false })} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
