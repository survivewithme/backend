const mongoose = require('mongoose')
const asyncExpress = require('async-express')
const jwt = require('jsonwebtoken')
const Coach = mongoose.model('Coach')
const Organization = mongoose.model('Organization')
const OrganizationCoach = mongoose.model('OrganizationCoach')

module.exports = (app) => {
  app.post('/coaches', createCoach)
}

const createCoach = asyncExpress(async (req, res) => {
  const { organizationId, token } = req.body
  try {
    jwt.verify(token, process.env.WEB_TOKEN_SECRET)
  } catch (err) {
    res.status(401).json({ message: 'Invalid token supplied'})
    return
  }
  const org = await Organization.findOne({
    _id: mongoose.Types.ObjectId(organizationId),
  }).exec()
  if (!org) {
    res.status(404).json({
      message: `Unable to find organization with id ${organizationId}`
    })
    return
  }
  const { _doc: coach } = await Coach.create(req.body)
  const { _doc: orgCoach } = await OrganizationCoach.create({
    organizationId,
    coachId: mongoose.Types.ObjectId(coach._id),
  })
  res.end()
})
