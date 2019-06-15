const mongoose = require('mongoose')
const Organization = mongoose.model('Organization')
const asyncExpress = require('async-express')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const { isAdmin } = require('./user')

module.exports = (app) => {
  app.get('/organizations', auth, loadOrganization)
  app.get('/organizations/invite', auth, inviteLink)
  app.get('/organizations/list', auth, loadOrganizations)
  app.post('/organizations', auth, createOrganization)
}

const generateInviteToken = (organizationId) => {
  const domain = 'https://website-jchancehud.survivewithme.now.sh'
  const token = jwt.sign({
    organizationId: organizationId.toString(),
    referralType: 'organization',
  }, process.env.WEB_TOKEN_SECRET, {
    // 5 days
    expiresIn: 5 * 24 * 60 * 60,
  })
  return `${domain}/signup?token=${token}`
}

const loadOrganizations = asyncExpress(async (req, res) => {
  if (!await isAdmin(req.user._id)) {
    res.status(401).json({ message: 'You must be an admin to do this' })
    return
  }
  const organizations = await Organization.find({}).lean().exec()
  res.json(organizations.map((organization) => ({
    ...organization,
    inviteLink: generateInviteToken(organization._id)
  })))
})

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
  if (!org) {
    res.status(404).json({ message: 'Unable to find specified organizationId'})
    return
  }
  const link = await generateInviteToken(req.query._id)
  res.json({ link })
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
