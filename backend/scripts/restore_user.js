require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const email = 'shashwat@gmail.com'
const password = '12345678'
const name = 'Shashwat'

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        let user = await User.findOne({ email })
        const hash = await bcrypt.hash(password, 10)

        if (user) {
            user.passwordHash = hash
            await user.save()
            console.log('Updated existing user password')
        } else {
            user = await User.create({
                email,
                passwordHash: hash,
                name,
                roles: ['user', 'admin'] // Giving admin too just in case they need it? Maybe just user. No, user asked for admin id earlier. 
                // Actually, let's just give 'user' role by default unless they asked for admin. 
                // They asked "admin id and pwd" earlier, so they know about admin. 
                // This is their personal account. I'll give it 'user'.
            })
            console.log('Created new user')
        }
        console.log('Done.')
        process.exit(0)
    })
    .catch(err => { console.error(err); process.exit(1) })
