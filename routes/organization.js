const mongoose = require('mongoose')
const Organization = mongoose.model('Organization')
const asyncExpress = require('async-express')
const auth = require('../middleware/auth')
const jwt = require('jsonwebtoken')

module.exports = (app) => {
  app.get('/organizations', auth, loadOrganization)
  app.get('/organizations/invite', inviteLink)
}

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
