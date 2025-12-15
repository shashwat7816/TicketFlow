const axios = require('axios')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const API = process.env.API_URL || 'http://localhost:4000'
const EVENT_ID = process.env.EVENT_ID
const SEAT_ID = process.env.SEAT_ID || 'S-1'
const CONCURRENT = parseInt(process.env.CONCURRENT || '20')
const ITER = parseInt(process.env.ITER || '100')

if(!EVENT_ID){
  console.error('Set EVENT_ID env var to run stress harness')
  process.exit(1)
}

const LOG_DIR = path.resolve(__dirname, '..', 'logs')
if(!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
const OUT = path.join(LOG_DIR, 'stress.log')

async function tryReserve(i){
  try{
    const resp = await axios.post(API + '/api/reservations', { eventId: EVENT_ID, seatIds: [SEAT_ID], holdSeconds: 60 })
    return { ok: true, id: resp.data.reservationId }
  }catch(e){
    return { ok: false, err: e.message || e }
  }
}

;(async ()=>{
  for(let iter=1; iter<=ITER; iter++){
    const t0 = Date.now()
    const promises = []
    for(let i=0;i<CONCURRENT;i++) promises.push(tryReserve(i+1))
    const results = await Promise.all(promises)
    const success = results.filter(r=>r.ok).length
    const failed = results.length - success
    const line = `[${new Date().toISOString()}] iter=${iter} success=${success} failed=${failed} time=${Date.now()-t0}ms` + '\n'
    fs.appendFileSync(OUT, line)
    console.log(line.trim())

    // detect connection errors
    const connErrors = results.filter(r=>!r.ok && typeof r.err === 'string' && r.err.toLowerCase().includes('connect'))
    if(connErrors.length){
      const diag = []
      diag.push('=== CONNECTION FAILURE DETECTED ===')
      diag.push(new Date().toISOString())
      try{ diag.push(execSync('tasklist').toString()) }catch(e){ diag.push('tasklist failed: ' + e.message) }
      try{ diag.push('\n--- out.log ---\n'); diag.push(fs.readFileSync(path.join(LOG_DIR, 'out.log'), 'utf8')) }catch(e){}
      try{ diag.push('\n--- err.log ---\n'); diag.push(fs.readFileSync(path.join(LOG_DIR, 'err.log'), 'utf8')) }catch(e){}
      fs.appendFileSync(path.join(LOG_DIR, 'critical.log'), diag.join('\n') + '\n\n')
      console.error('Connection failure detected; diagnostics written to logs/critical.log')
      process.exit(2)
    }
  }
  console.log('Stress run completed')
  process.exit(0)
})()
