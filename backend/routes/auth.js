const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const User = require('../models/user')
// const RefreshToken = require('../models/refreshToken') // Deprecated
const { body, validationResult } = require('express-validator')


router.use(cookieParser())

function signAccess(user) {
  return jwt.sign({ id: user._id, email: user.email, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '15m' })
}

function signRefresh() {
  return require('crypto').randomBytes(64).toString('hex')
}

// Register
router.post('/register', [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('password should be min 6 char'),
  body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'email already used' })
    const hash = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({ email, passwordHash: hash, name, refreshTokens: [] })

    const accessToken = signAccess(user)
    const refreshTokenValue = signRefresh()
    const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_EXPIRES_SECONDS || '2592000') * 1000)) // default 30d

    user.refreshTokens.push({ token: refreshTokenValue, expiresAt })
    await user.save()

    res.cookie('refreshToken', refreshTokenValue, { httpOnly: true, secure: false, sameSite: 'lax', expires: expiresAt })
    res.status(201).json({ accessToken, user: { id: user._id, email: user.email, name: user.name, roles: user.roles } })
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email & password required' })
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.passwordHash || '')
    if (!ok) return res.status(400).json({ error: 'invalid credentials' })

    const accessToken = signAccess(user)
    const refreshTokenValue = signRefresh()
    const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_EXPIRES_SECONDS || '2592000') * 1000))

    // Add new token
    user.refreshTokens.push({ token: refreshTokenValue, expiresAt })
    // Optional: cleanup old tokens
    user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date())

    await user.save()

    res.cookie('refreshToken', refreshTokenValue, { httpOnly: true, secure: false, sameSite: 'lax', expires: expiresAt })
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name, roles: user.roles } })
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken
    if (!token) return res.status(401).json({ error: 'no refresh token' })

    // Find user with this token
    const user = await User.findOne({ 'refreshTokens.token': token })
    if (!user) return res.status(401).json({ error: 'invalid refresh token' })

    const storedToken = user.refreshTokens.find(t => t.token === token)

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Token invalid or expired - remove it
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== token)
      await user.save()
      return res.status(401).json({ error: 'refresh token expired' })
    }

    // rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== token) // remove old
    const newToken = signRefresh()
    const expiresAt = new Date(Date.now() + (parseInt(process.env.REFRESH_EXPIRES_SECONDS || '2592000') * 1000))
    user.refreshTokens.push({ token: newToken, expiresAt })

    await user.save()

    const accessToken = signAccess(user)
    res.cookie('refreshToken', newToken, { httpOnly: true, secure: false, sameSite: 'lax', expires: expiresAt })
    res.json({ accessToken })
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies && req.cookies.refreshToken
    if (token) {
      await User.updateOne(
        { 'refreshTokens.token': token },
        { $pull: { refreshTokens: { token: token } } }
      )
    }
    res.clearCookie('refreshToken')
    res.json({ ok: true })
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }) }
})

// Me
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  try {
    const payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    const user = await User.findById(payload.id).lean()
    if (!user) return res.status(404).json({ error: 'user not found' })
    res.json({ id: user._id, email: user.email, name: user.name, roles: user.roles })
  } catch (e) { return res.status(401).json({ error: 'invalid token' }) }
})

module.exports = router
