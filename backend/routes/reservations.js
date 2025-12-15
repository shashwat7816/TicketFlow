const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Reservation = require('../models/reservation')
const Seat = require('../models/seat')

// Create a reservation (hold seats) using per-seat documents to avoid races
router.post('/', async (req,res)=>{
  try{
    const { eventId, userId, seatIds, holdSeconds } = req.body
    if(!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length===0) return res.status(400).json({error:'invalid input'})

    // If multiple seats are requested, try to use MongoDB transactions for atomicity.
    // Transactions require a replica set (Atlas or local replica set). If transactions
    // are not supported, fallback to sequential per-seat updates with rollback.
    if(seatIds.length > 1){
      let usedTx = false
      try{
        const session = await mongoose.startSession()
        try{
          let createdRes = null
          await session.withTransaction(async ()=>{
            // try to reserve all seats within the transaction
            for(const sid of seatIds){
              const s = await Seat.findOneAndUpdate({ eventId, seatId: sid, status: 'available' }, { $set: { status: 'reserved' } }, { new: true, session })
              if(!s) throw new Error('not-available')
            }
            const expiresAt = new Date(Date.now() + (holdSeconds || 5*60) * 1000)
            createdRes = await Reservation.create([{ userId, eventId, seatIds, expiresAt }], { session })
          })
          session.endSession()
          console.log('transaction-based reservation succeeded for seats', seatIds)
          if(createdRes && createdRes.length>0){
            usedTx = true
            const r = createdRes[0]
            return res.status(201).json({ reservationId: r._id, expiresAt: r.expiresAt })
          }
        }catch(e){
          session.endSession()
          // If we threw 'not-available', map to 409; else fall through to fallback
          if(e.message === 'not-available') return res.status(409).json({ error: 'some seats not available' })
          console.warn('transaction attempt failed, falling back to non-transactional path:', e.message)
        }
      }catch(e){
        // starting sessions or transactions may fail on standalone servers
        console.warn('unable to start transaction (likely non-replica set):', e.message)
      }
      if(usedTx) return // already responded
      // fallback: proceed to sequential reservation with rollback
    }

    // Sequential reservation (fallback or single-seat flow)
    const reserved = []
    for(const sid of seatIds){
      const s = await Seat.findOneAndUpdate({ eventId, seatId: sid, status: 'available' }, { $set: { status: 'reserved' } }, { new: true })
      if(s) reserved.push(sid)
      else break
    }

    if(reserved.length !== seatIds.length){
      if(reserved.length>0) await Seat.updateMany({ eventId, seatId: { $in: reserved } }, { $set: { status: 'available' } })
      const unavailable = seatIds.filter(sid => !reserved.includes(sid))
      return res.status(409).json({ error: 'some seats not available', seats: unavailable })
    }

    const expiresAt = new Date(Date.now() + (holdSeconds || 5*60) * 1000)
    const r = await Reservation.create({ userId, eventId, seatIds, expiresAt })
    return res.status(201).json({ reservationId: r._id, expiresAt })
  }catch(err){
    console.error(err)
    // in case of an error, try to rollback reserved seats
    try{ if(Array.isArray(req.body.seatIds) && req.body.seatIds.length>0) await Seat.updateMany({ eventId: req.body.eventId, seatId: { $in: req.body.seatIds } }, { $set: { status: 'available' } }) }catch(e){ console.error('rollback failed', e) }
    res.status(500).json({ error: 'internal' })
  }
})

// Cancel reservation
router.post('/:id/cancel', async (req,res)=>{
  try{
    const r = await Reservation.findById(req.params.id)
    if(!r) return res.status(404).json({error:'not found'})
    if(r.status !== 'active') return res.status(400).json({error:'cannot cancel'})

    // release seats
    await Seat.updateMany({ eventId: r.eventId, seatId: { $in: r.seatIds } }, { $set: { status: 'available' } })

    r.status = 'cancelled'
    await r.save()
    res.json({ ok:true })
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

module.exports = router
