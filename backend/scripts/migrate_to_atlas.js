const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from backend/.env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/user');
const Event = require('../models/event');
const Order = require('../models/order');
// Add other models if needed: PassType, etc.
// Based on previous file explorations, we have User, Event, Order. 
// I should check if there are others like PassType but start with these core ones.

const LOCAL_URI = 'mongodb://localhost:27017/ticketflow';
const ATLAS_URI = process.env.MONGO_URI;

if (!ATLAS_URI || ATLAS_URI.includes('localhost')) {
    console.error('ERROR: MONGO_URI in .env seems to be localhost or missing. Please set it to your Atlas URI.');
    process.exit(1);
}

async function migrate() {
    console.log('🚀 Starting migration...');

    // 1. Fetch data from Local
    console.log('1. Connecting to LOCAL DB:', LOCAL_URI);
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();

    // We need to define models on the connection to fetch data
    // Or simpler: use generic collection access if we don't want to re-compile models attached to specific connections
    // But since we have schema matching, let's just use raw docs

    const users = await localConn.collection('users').find().toArray();
    const events = await localConn.collection('events').find().toArray();
    const orders = await localConn.collection('orders').find().toArray();
    // Check for other collections if possible, but these are the main ones
    const passTypes = await localConn.collection('passtypes').find().toArray().catch(() => []);

    console.log(`   Found: ${users.length} users, ${events.length} events, ${orders.length} orders, ${passTypes.length} passTypes`);

    await localConn.close();

    // 2. Insert into Atlas
    console.log('2. Connecting to ATLAS DB...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();

    // Helper to insert
    const insert = async (name, data) => {
        if (data.length === 0) return;
        const col = atlasConn.collection(name);
        // cleaning up _id collisions? usually we want to KEEP _id to preserve relationships
        // Try insertMany with ordered: false to ignore duplicates (optional strategy) or deleteMany first

        // Strategy: Clear Atlas and overwrite (safest to ensure consistent state)
        console.log(`   Clearing ${name} collection in Atlas...`);
        await col.deleteMany({});

        console.log(`   Inserting ${data.length} documents into ${name}...`);
        await col.insertMany(data);
    };

    await insert('users', users);
    await insert('events', events);
    await insert('orders', orders);
    if (passTypes.length > 0) await insert('passtypes', passTypes);

    console.log('✅ Migration successful!');
    await atlasConn.close();
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
