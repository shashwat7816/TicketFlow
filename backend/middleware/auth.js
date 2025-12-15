const jwt = require('jsonwebtoken')
const User = require('../models/user')

function authMiddleware(req,res,next){
  const auth = req.headers.authorization
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' })
  const token = auth.split(' ')[1]
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    return next()
  }catch(e){
    return res.status(401).json({ error: 'invalid token' })
  }
}

function requireRole(role){
  return (req,res,next)=>{
    if(!req.user) return res.status(401).json({ error: 'not authenticated' })
    if(!req.user.roles || !req.user.roles.includes(role)) return res.status(403).json({ error: 'forbidden' })
    next()
  }
}

module.exports = { authMiddleware, requireRole }
