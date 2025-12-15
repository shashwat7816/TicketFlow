const axios = require('axios')

// Simple concurrency test: N clients try to reserve the same seat
const API = process.env.API_URL || 'http://localhost:4000'
const eventId = process.env.EVENT_ID || '' // supply event id via env
const seatId = process.env.SEAT_ID || 'S-1'
const concurrent = parseInt(process.env.CONCURRENT || '10')

if(!eventId){
  console.error('Set EVENT_ID env var to run test')
  process.exit(1)
}

async function tryReserve(i){
  try{
    const resp = await axios.post(API + '/api/reservations', { eventId, seatIds: [seatId], holdSeconds: 60 })
    console.log(`#${i}: success -> reservation ${resp.data.reservationId}`)
    return true
  }catch(e){
    console.log(`#${i}: failed -> ${e.response?.data?.error || e.message}`)
    return false
  }
}

;(async ()=>{
  const promises = []
  for(let i=0;i<concurrent;i++) promises.push(tryReserve(i+1))
  const results = await Promise.all(promises)
  console.log('Summary: success=', results.filter(Boolean).length, 'failed=', results.filter(r=>!r).length)
  process.exit(0)
})()
