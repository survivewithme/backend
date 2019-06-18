const express = require('express')
const asyncExpress = require('async-express')
const mongoose = require('mongoose')
require('./models/organization')
require('./models/organizationCoach')
require('./models/user')
require('./models/userAdministrator')
require('./models/quiz')

const app = express()
app.use(express.json())
app.use((_, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT')
  res.set('Access-Control-Allow-Headers', 'content-type')
  next()
})

app.use(asyncExpress(async (_1, _2, next) => {
  await mongoose.connect(process.env.DB_URI, {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
  })
  next()
}))

require('./routes/organization')(app)
require('./routes/user')(app)
require('./routes/quiz')(app)

module.exports = {
  default: app,
}
