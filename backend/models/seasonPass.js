const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SeasonPassSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  passTypeId: { type: Schema.Types.ObjectId, ref: 'PassType', required: true },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  remainingCredits: { type: Number, default: 0 }, // For credit based passes
  status: { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' },
  usageHistory: [{
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    date: { type: Date, default: Date.now },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' }
  }]
}, { timestamps: true })

module.exports = mongoose.model('SeasonPass', SeasonPassSchema)
