const mongoose = require('mongoose');
const PassType = require('../models/PassType');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ticketflow');
    const types = await PassType.find({});
    console.log('Count:', types.length);
    types.forEach(t => {
        console.log(`ID: ${t._id}, Name: ${t.name}, Active: ${t.active} (Type: ${typeof t.active})`);
    });
    process.exit(0);
}

check().catch(console.error);
