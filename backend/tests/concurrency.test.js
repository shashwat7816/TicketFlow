const axios = require('axios')
const { expect } = require('chai')

const API = process.env.API_URL || 'http://localhost:4000'
const EVENT_ID = process.env.EVENT_ID // must be provided
const SEAT_ID = process.env.SEAT_ID || 'S-1'
const CONCURRENT = parseInt(process.env.CONCURRENT || '20')

describe('concurrency reservation test', function(){
  it('should allow at most one successful reservation for the same seat', async function(){
    if(!EVENT_ID) this.skip()

    const promises = []
    for(let i=0;i<CONCURRENT;i++){
      promises.push(
        axios.post(API + '/api/reservations', { eventId: EVENT_ID, seatIds: [SEAT_ID], holdSeconds: 60 })
          .then(()=>({ ok:true }))
          .catch(()=>({ ok:false }))
      )
    }
    const results = await Promise.all(promises)
    const success = results.filter(r=>r.ok).length
    console.log('summary -> success=', success, 'failed=', results.length-success)

    // For a single seat, at most 1 successful reservation should occur
    expect(success).to.be.at.most(1)
  })
})
