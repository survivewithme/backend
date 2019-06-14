const mongoose = require('mongoose')

const AdministratorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    }
  }
)

module.exports = mongoose.model('Administrator', AdministratorSchema)
