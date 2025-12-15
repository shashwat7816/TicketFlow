const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const User = require('../models/user')
const RefreshToken = require('../models/refreshToken')

router.use(cookieParser())

function signAccess(user){
  return jwt.sign({ id: user._id, email: user.email, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '15m' })
}

function signRefresh(){
  return require('crypto').randomBytes(64).toString('hex')
}

// Register
router.post('/register', async (req,res)=>{
  try{
    const { email, password, name } = req.body
    if(!email || !password) return res.status(400).json({ error: 'email & password required' })
    const existing = await User.findOne({ email })
    if(existing) return res.status(409).json({ error: 'email already used' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash: hash, name })

    const accessToken = signAccess(user)
    const refreshTokenValue = signRefresh()
    const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_EXPIRES_SECONDS || '2592000')*1000)) // default 30d
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt })

    res.cookie('refreshToken', refreshTokenValue, { httpOnly:true, secure:false, sameSite:'lax', expires: expiresAt })
    res.status(201).json({ accessToken, user: { id: user._id, email: user.email, name: user.name, roles: user.roles } })
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Login
router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body
    if(!email || !password) return res.status(400).json({ error: 'email & password required' })
    const user = await User.findOne({ email })
    if(!user) return res.status(400).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash || '')
    if(!ok) return res.status(400).json({ error: 'invalid credentials' })

    const accessToken = signAccess(user)
    const refreshTokenValue = signRefresh()
    const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_EXPIRES_SECONDS || '2592000')*1000))
    await RefreshToken.create({ token: refreshTokenValue, userId: user._id, expiresAt })
    res.cookie('refreshToken', refreshTokenValue, { httpOnly:true, secure:false, sameSite:'lax', expires: expiresAt })
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name, roles: user.roles } })
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Refresh token
router.post('/refresh', async (req,res)=>{
  try{
    const token = req.cookies && req.cookies.refreshToken
    if(!token) return res.status(401).json({ error: 'no refresh token' })
    const stored = await RefreshToken.findOne({ token })
    if(!stored) return res.status(401).json({ error: 'invalid refresh token' })
    if(stored.expiresAt < new Date()){
      await RefreshToken.deleteOne({ _id: stored._id })
      return res.status(401).json({ error: 'refresh token expired' })
    }
    const user = await User.findById(stored.userId)
    if(!user) return res.status(401).json({ error: 'user not found' })

    // rotate refresh token
    await RefreshToken.deleteOne({ _id: stored._id })
    const newToken = signRefresh()
    const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_EXPIRES_SECONDS || '2592000')*1000))
    await RefreshToken.create({ token: newToken, userId: user._id, expiresAt })

    const accessToken = signAccess(user)
    res.cookie('refreshToken', newToken, { httpOnly:true, secure:false, sameSite:'lax', expires: expiresAt })
    res.json({ accessToken })
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Logout
router.post('/logout', async (req,res)=>{
  try{
    const token = req.cookies && req.cookies.refreshToken
    if(token) await RefreshToken.deleteOne({ token })
    res.clearCookie('refreshToken')
    res.json({ ok:true })
  }catch(err){ console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Me
router.get('/me', async (req,res)=>{
  const auth = req.headers.authorization
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  try{
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    const user = await User.findById(payload.id).lean()
    if(!user) return res.status(404).json({ error: 'user not found' })
    res.json({ id: user._id, email: user.email, name: user.name, roles: user.roles })
  }catch(e){ return res.status(401).json({ error: 'invalid token' }) }
})

module.exports = router
