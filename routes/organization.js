const mongoose = require('mongoose')
const Organization = mongoose.model('Organization')
const asyncExpress = require('async-express')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const { isAdmin } = require('./user')

module.exports = (app) => {
  app.get('/organizations', auth, loadOrganization)
  app.get('/organizations/invite', auth, inviteLink)
  app.post('/organizations', auth, createOrganization)
}

const createOrganization = asyncExpress(async (req, res) => {
  if (!await isAdmin(req.user._id)) {
    res.status(401).json({ message: 'You must be an admin to do this' })
    return
  }
  const { _doc } = await Organization.create(req.body)
  res.json(_doc)
})

const inviteLink = asyncExpress(async (req, res) => {
  if (!await isAdmin(req.user._id)) {
    res.status(401).json({ message: 'You must be an admin to do this' })
    return
  }
  const org = await Organization.findOne({
    _id: mongoose.Types.ObjectId(req.query._id),
  }).exec()
  const domain = 'https://website-jchancehud.survivewithme.now.sh'
  const token = jwt.sign({
    organizationId: org._id.toString(),
    referralType: 'organization',
  }, process.env.WEB_TOKEN_SECRET, {
    // 5 days
    expiresIn: 5 * 24 * 60 * 60,
  })
  res.json({ link: `${domain}/signup?token=${token}` })
})

const loadOrganization = asyncExpress(async (req, res) => {
  if (!await isAdmin(req.user._id)) {
    res.status(401).json({ message: 'You must be an admin to do this' })
    return
  }
  const org = await Organization.findOne({
    _id: req.query._id,
  }).lean().exec()
  res.json(org)
})
