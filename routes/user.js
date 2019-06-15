const mongoose = require('mongoose')
const asyncExpress = require('async-express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = mongoose.model('User')
const Organization = mongoose.model('Organization')
const UserAdministrator = mongoose.model('UserAdministrator')
const OrganizationCoach = mongoose.model('OrganizationCoach')

module.exports = (app) => {
  app.post('/users', createUser)
  app.post('/users/login', login)
  app.get('/users/invite/parse', parseInviteToken)
}

const isAdmin = async (userId) => {
  const admin = await UserAdministrator.findOne({
    userId: mongoose.Types.ObjectId(userId),
  }).exec()
  return !!admin
}
module.exports.isAdmin = isAdmin

const login = asyncExpress(async (req, res) => {
  const email = req.body.email.toLowerCase()
  const user = await User.findOne({
    email,
  })
  .lean()
  .exec()
  if (!user) {
    res.status(404).json({
      message: 'This email is not registered'
    })
    return
  }
  const passwordMatch = await bcrypt.compare(
    req.body.password,
    user.passwordHash
  )
  if (!passwordMatch) {
    res.status(401).json({
      message: 'Invalid password supplied'
    })
    return
  }
  const token = jwt.sign({
    ...user, passwordHash: ''
  }, process.env.WEB_TOKEN_SECRET)
  res.json({
    ...user,
    passwordHash: '',
    token,
    isAdmin: (await isAdmin(user._id)),
  })
})

const parseInviteToken = asyncExpress(async (req, res) => {
  try {
    const payload = jwt.verify(req.query.token, process.env.WEB_TOKEN_SECRET)
    if (payload.referralType === 'organization') {
      const organization = await Organization.findOne({
        _id: mongoose.Types.ObjectId(payload.organizationId),
      }).lean().exec()
      if (!organization) {
        res.status(400).json({ message: 'Invalid organizationId supplied in token' })
        return
      }
      res.json({
        referralType: payload.referralType,
        organizationId: payload.organizationId,
        organization,
      })
      return
    }
    throw new Error('Unknown referralType', payload.referralType)
  } catch (err) {
    console.log(err)
    res.status(400).json({ message: 'Error parsing supplied token'})
  }
})

const createUser = asyncExpress(async (req, res) => {
  const { token } = req.body
  let organizationId
  try {
    const payload = jwt.verify(token, process.env.WEB_TOKEN_SECRET)
    organizationId = payload.organizationId
    if (organizationId) {
      const org = await Organization.findOne({
        _id: mongoose.Types.ObjectId(organizationId),
      }).exec()
      if (!org) {
        res.status(404).json({
          message: `Unable to find organization with id ${organizationId}`
        })
        return
      }
    }
  } catch (err) {
    res.status(401).json({ message: 'Invalid token supplied'})
    return
  }
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(req.body.password, salt)
  const { _doc: user } = await User.create({
    ...req.body,
    createdAt: new Date(),
    passwordHash,
  })
  const _token = jwt.sign({
    ...user, passwordHash: '',
  }, process.env.WEB_TOKEN_SECRET)
  if (organizationId) {
    const { _doc: orgCoach } = await OrganizationCoach.create({
      organizationId,
      userId: mongoose.Types.ObjectId(user._id),
    })
  }
  res.json({...user, passwordHash: '', token: _token })
})
