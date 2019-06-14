const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

module.exports = (req, res, next) => {
  const token = req.body.token || req.query.token
  if (!token) {
    res.status(400).json({ message: 'No token supplied to admin auth'})
    return
  }
  try {
    const admin = jwt.verify(token, process.env.WEB_TOKEN_SECRET)
    if (admin._id) {
      admin._id = mongoose.Types.ObjectId(admin._id)
    }
    req.admin = admin
    next()
  } catch (err) {
    res.status(400)
    res.json({ message: 'Error parsing token in admin auth'})
  }
}
