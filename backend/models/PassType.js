const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PassTypeSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    durationDays: { type: Number, required: true }, // Validity period in days
    type: { type: String, enum: ['unlimited', 'credits'], required: true },
    credits: { type: Number, default: 0 }, // If type is credits, how many?
    active: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('PassType', PassTypeSchema)
