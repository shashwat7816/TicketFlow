const mongoose = require('mongoose');
const PassType = require('../models/PassType');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ticketflow');
    const types = await PassType.find({});
    console.log('Pass Types in DB:', JSON.stringify(types, null, 2));
    process.exit(0);
}

check().catch(console.error);
