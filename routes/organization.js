const mongoose = require('mongoose')
const Organization = mongoose.model('Organization')
const asyncExpress = require('async-express')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')
const administratorAuth = requrie('../middleware/administratorAuth')

module.exports = (app) => {
  app.get('/organizations', administratorAuth, loadOrganization)
  app.get('/organizations/invite', administratorAuth, inviteLink)
  app.post('/organizations', administratorAuth, )
}

const createOrganization = asyncExpress(async (req, res) => {
  const { _doc } = await Organization.create(req.body)
  res.json(_doc)
})

const inviteLink = asyncExpress(async (req, res) => {
  const org = await Organization.findOne({
    _id: mongoose.Types.ObjectId(req.query._id),
  }).exec()
  const domain = 'https://website-jchancehud.survivewithme.now.sh'
  const token = jwt.sign({
    organizationId: org._id.toString(),
  }, process.env.WEB_TOKEN_SECRET, {
    expiresIn: 60 * 60,
  })
  res.json({ link: `${domain}/coach/create?token=${token}` })
})

const loadOrganization = asyncExpress(async (req, res) => {
  const org = await Organization.findOne({
    _id: req.query._id,
  }).lean().exec()
  res.json(org)
})
