require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/user')

const email = process.argv[2]
if (!email) {
    console.error('Usage: node promote_admin.js <email>')
    process.exit(1)
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findOne({ email })
        if (!user) {
            console.error('User not found:', email)
            process.exit(1)
        }

        if (!user.roles.includes('admin')) {
            user.roles.push('admin')
            await user.save()
            console.log(`User ${email} is now an ADMIN.`)
        } else {
            console.log(`User ${email} is already an admin.`)
        }
        process.exit(0)
    })
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
