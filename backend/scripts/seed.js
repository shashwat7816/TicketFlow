require('dotenv').config()
const mongoose = require('mongoose')
const Event = require('../models/event')
const User = require('../models/user')

async function seed(){
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ticketflow')
  console.log('Connected to Mongo')

  await Event.deleteMany({})
  await User.deleteMany({})

  const ev = await Event.create({
    name: 'Sample Concert',
    description: 'A sample event for development',
    venue: 'Main Hall',
    date: new Date(Date.now() + 1000*60*60*24*7),
    seatingChart: Array.from({length: 50}).map((_,i)=>({
      seatId: `S-${i+1}`,
      section: 'A',
      row: String(Math.floor(i/10)+1),
      number: String((i%10)+1)
    }))
  })

  // Populate per-seat documents to support concurrent-safe reservations
  const Seat = require('../models/seat')
  await Seat.deleteMany({ eventId: ev._id })
  const seats = ev.seatingChart.map(s => ({ eventId: ev._id, seatId: s.seatId, section: s.section, row: s.row, number: s.number }))
  await Seat.insertMany(seats)

  const u = await User.create({ email: 'alice@example.com', name: 'Alice' })

  console.log('Seeded:', ev._id.toString(), u.email)
  process.exit(0)
}

seed().catch(err=>{ console.error(err); process.exit(1) })
