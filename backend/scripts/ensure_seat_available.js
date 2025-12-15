require('dotenv').config()
const mongoose = require('mongoose')
const Seat = require('../models/seat')

const EVENT_ID = process.env.EVENT_ID
const SEAT_ID = process.env.SEAT_ID || 'S-10'

if(!EVENT_ID){
  console.error('Set EVENT_ID env var to run this script')
  process.exit(1)
}

;(async ()=>{
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ticketflow')
  await Seat.updateMany({ eventId: EVENT_ID, seatId: SEAT_ID }, { $set: { status: 'available' } })
  console.log(`Seat ${SEAT_ID} for event ${EVENT_ID} set to available`)
  process.exit(0)
})().catch(err=>{ console.error(err); process.exit(1) })
