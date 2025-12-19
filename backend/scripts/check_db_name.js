const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ATLAS_URI = process.env.MONGO_URI;

console.log('URI loaded.');

mongoose.connect(ATLAS_URI)
    .then(() => {
        console.log('Connected!');
        console.log('Database Name:', mongoose.connection.name);
        return mongoose.connection.close();
    })
    .catch(err => {
        console.error('Connection failed:', err.message);
    });
