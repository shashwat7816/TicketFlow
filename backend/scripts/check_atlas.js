const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ATLAS_URI = process.env.MONGO_URI;

async function check() {
    console.log('Connecting to Atlas...');
    const conn = await mongoose.createConnection(ATLAS_URI).asPromise();

    // Use the native admin interface to list databases
    const admin = conn.db.admin();
    const result = await admin.listDatabases();

    console.log('Databases found:', result.databases.map(d => d.name));

    for (const dbInfo of result.databases) {
        const dbName = dbInfo.name;
        if (dbName === 'local' || dbName === 'admin') continue;

        console.log(`Checking DB: ${dbName}`);
        const db = conn.useDb(dbName);
        const collections = await db.listCollections().toArray();
        console.log(`   Collections: ${collections.map(c => c.name).join(', ')}`);
    }

    await conn.close();
}

check().catch(console.error);
