const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SeatSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  seatId: { type: String, required: true },
  section: String,
  row: String,
  number: String,
  status: { type: String, enum: ['available','reserved','sold','blocked'], default: 'available', index: true }
}, { timestamps: true })

SeatSchema.index({ eventId: 1, seatId: 1 }, { unique: true })

module.exports = mongoose.model('Seat', SeatSchema)
