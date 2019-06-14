const mongoose = require('mongoose')
const User = mongoose.model('User')
const asyncExpress = require('async-express')

module.exports = (app) => {
  app.post('/users', createUser)
}

const createUser = asyncExpress(async (req, res) => {
  //stub
  const { _doc } = await User.create(req.body)
})
