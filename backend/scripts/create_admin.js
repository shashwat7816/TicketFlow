require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const email = 'admin@example.com'
const password = 'password'
const name = 'System Admin'

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        // Check if exists
        let user = await User.findOne({ email })
        if (user) {
            console.log('User exists. Updating password and roles...')
            user.passwordHash = await bcrypt.hash(password, 10)
            if (!user.roles.includes('admin')) user.roles.push('admin')
            await user.save()
        } else {
            console.log('Creating new admin user...')
            const hash = await bcrypt.hash(password, 10)
            user = await User.create({ email, passwordHash: hash, name, roles: ['admin'] })
        }

        console.log('SUCCESS: Admin user ready.')
        console.log('Email:', email)
        console.log('Password:', password)
        process.exit(0)
    })
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
