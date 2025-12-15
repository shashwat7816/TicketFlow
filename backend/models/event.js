const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SeatSchema = new Schema({
  seatId: String,
  section: String,
  row: String,
  number: String,
  status: { type: String, enum: ['available', 'reserved', 'sold', 'blocked'], default: 'available' }
})

const EventSchema = new Schema({
  name: String,
  description: String,
  venue: String,
  date: Date,
  bannerUrl: String,
  eventType: { type: String, enum: ['seated', 'general'], default: 'general' },
  capacity: { type: Number, default: 0 },
  ticketTiers: [{
    name: String,
    price: Number,
    quantity: Number
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  seatingChart: [SeatSchema],
}, { timestamps: true })

module.exports = mongoose.model('Event', EventSchema)
