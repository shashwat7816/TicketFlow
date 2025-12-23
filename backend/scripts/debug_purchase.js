const mongoose = require('mongoose');
const PassType = require('../models/PassType');
const SeasonPass = require('../models/seasonPass');
const Order = require('../models/order');
const User = require('../models/user');
require('dotenv').config();

async function simulatePurchase() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ticketflow');

    // Find a user and a pass type
    const user = await User.findOne({ email: 'test@example.com' });
    const passType = await PassType.findOne({});

    if (!user || !passType) {
        console.error("User or PassType not found");
        process.exit(1);
    }

    console.log(`Attempting purchase for User: ${user._id} and Pass: ${passType._id}`);

    try {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + passType.durationDays);

        // 1. Create Pass
        const userPass = await SeasonPass.create({
            userId: user._id,
            passTypeId: passType._id,
            expiryDate,
            remainingCredits: passType.type === 'credits' ? passType.credits : 0,
        });
        console.log("Pass created:", userPass._id);

        // 2. Create Order
        const order = await Order.create({
            userId: user._id,
            total: passType.price,
            orderType: 'season_pass',
            passTypeId: passType._id,
            paymentStatus: 'paid'
        });
        console.log("Order created:", order._id);

    } catch (e) {
        console.error("Purchase Failed:", e);
    }
    process.exit(0);
}

simulatePurchase();
