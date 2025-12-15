require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/user')

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findOne({ email: 'shashwat@gmail.com' })
        if (user) {
            console.log('User FOUND:', user.email, user._id)
            if (user.roles) console.log('Roles:', user.roles)
        } else {
            console.log('User NOT FOUND')
        }

        // Also list all users to see who IS there
        const all = await User.find({}, 'email')
        console.log('All Users:', all.map(u => u.email))

        process.exit(0)
    })
    .catch(err => { console.error(err); process.exit(1) })
