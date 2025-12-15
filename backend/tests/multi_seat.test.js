const axios = require('axios')
const { expect } = require('chai')

const API = process.env.API_URL || 'http://localhost:4000'
const EVENT_ID = process.env.EVENT_ID // must be provided
const SEAT_IDS = (process.env.SEAT_IDS || 'S-2,S-3').split(',')
const CONCURRENT = parseInt(process.env.CONCURRENT || '10')
const mongoose = require('mongoose')
const Seat = require('../models/seat')
const Reservation = require('../models/reservation')

async function reserve(i){
  try{
    const resp = await axios.post(API + '/api/reservations', { eventId: EVENT_ID, seatIds: SEAT_IDS, holdSeconds: 60 })
    return { ok:true, id: resp.data.reservationId }
  }catch(e){
    return { ok:false, err: e.response?.data }
  }
}

describe('multi-seat atomic reservation', function(){
  it('should allow at most one concurrent reservation to succeed and if succeeded reserve ALL seats', async function(){
    if(!EVENT_ID) this.skip()
    // cleanup: ensure target seats are available and remove previous reservations
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ticketflow')
    await Reservation.deleteMany({ eventId: EVENT_ID })
    await Seat.updateMany({ eventId: EVENT_ID, seatId: { $in: SEAT_IDS } }, { $set: { status: 'available' } })

    const promises = []
    for(let i=0;i<CONCURRENT;i++) promises.push(reserve(i+1))
    const results = await Promise.all(promises)
    const success = results.filter(r=>r.ok)
    console.log('multi-seat summary -> success=', success.length, 'failed=', results.length-success.length)

    expect(success.length).to.be.at.most(1)

    // verify seats state via API
    const seating = (await axios.get(API + `/api/events/${EVENT_ID}/seating`)).data
    const affected = seating.filter(s => SEAT_IDS.includes(s.seatId))
    const reservedCount = affected.filter(s=>s.status === 'reserved').length
    // either 0 (none reserved) or all seats reserved
    expect([0, SEAT_IDS.length]).to.include(reservedCount)
  })
})
