const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ATLAS_URI = process.env.MONGO_URI;

async function checkCount() {
    try {
        console.log('Connecting to Atlas...');
        // Force 'test' db just in case, though URI should handle it
        const conn = await mongoose.createConnection(ATLAS_URI).asPromise();

        const dbName = conn.name;
        console.log(`Connected to Database: ${dbName}`);

        const eventCount = await conn.collection('events').countDocuments();
        const userCount = await conn.collection('users').countDocuments();

        console.log(`Users count: ${userCount}`);
        console.log(`Events count: ${eventCount}`);

        if (eventCount === 0) {
            console.log('WARNING: No events found! Migration might be empty.');
        } else {
            console.log('SUCCESS: Data exists in the database.');
        }

        await conn.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

checkCount();
