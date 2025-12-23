require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/auth')
const eventsRoutes = require('./routes/events')
const ordersRoutes = require('./routes/orders')
// const reservationsRoutes = require('./routes/reservations') // Deprecated
const adminRoutes = require('./routes/admin')
const passRoutes = require('./routes/passRoutes')
const supportRoutes = require('./routes/supportRoutes')
const Event = require('./models/event')

const app = express()
app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))
app.use(async (req, res, next) => { if (req.method === 'OPTIONS') return res.sendStatus(200); next() }) // Preflight fix attempt
app.use(cookieParser())
app.use(express.json())

// Ensure logs directory exists for crash dumps
const fs = require('fs')
const path = require('path')
const LOG_DIR = path.resolve(__dirname, 'logs')
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })

function dumpCriticalError(source, err) {
  try {
    const out = `[${new Date().toISOString()}] ${source}: ${err && err.stack ? err.stack : String(err)}\n\n`
    fs.appendFileSync(path.join(LOG_DIR, 'critical.log'), out)
    console.error(source, err)
  } catch (e) {
    console.error('failed to write critical log', e)
  }
}

app.use('/api/auth', authRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/reservations', ordersRoutes) // Mapped to Orders (create reserved order)
app.use('/api/orders', ordersRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/passes', passRoutes)
app.use('/api/support', supportRoutes)

app.get('/', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ticketflow')
  .then(() => {
    // bind to 0.0.0.0 to ensure IPv4 (127.0.0.1) clients can connect on Windows
    app.listen(PORT, '0.0.0.0', () => console.log('Backend listening on', PORT))
    // background job: clear expired reservations every minute (release per-seat documents)
    // background job: clear expired reservations (pending orders) every minute
    const Order = require('./models/order')
    const Event = require('./models/event')
    setInterval(async () => {
      try {
        const now = new Date()
        const expired = await Order.find({ status: 'reserved', expiresAt: { $lte: now } }).limit(50)
        for (const o of expired) {
          // release seats
          const seatIds = o.tickets.map(t => t.seatId)
          if (seatIds.length > 0) {
            await Event.updateOne(
              { _id: o.eventId },
              { $set: { "seatingChart.$[elem].status": "available" } },
              { arrayFilters: [{ "elem.seatId": { $in: seatIds } }] }
            )
          }
          o.status = 'cancelled'
          await o.save()
        }
      } catch (e) { console.error('order cleanup error', e) }
    }, 60 * 1000)
  })
  .catch(err => {
    console.error('MongoDB connection error', err)
    process.exit(1)
  })

// Global error handlers to capture crashes and unhandled rejections
process.on('uncaughtException', (err) => {
  dumpCriticalError('uncaughtException', err)
  // give other handlers a moment then exit
  setTimeout(() => process.exit(1), 1000)
})

process.on('unhandledRejection', (reason) => {
  dumpCriticalError('unhandledRejection', reason)
  setTimeout(() => process.exit(1), 1000)
})

// Graceful shutdown logging
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down')
  fs.appendFileSync(path.join(LOG_DIR, 'critical.log'), `[${new Date().toISOString()}] SIGINT\n`)
  process.exit(0)
})
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down')
  fs.appendFileSync(path.join(LOG_DIR, 'critical.log'), `[${new Date().toISOString()}] SIGTERM\n`)
  process.exit(0)
})
