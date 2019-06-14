const mongoose = require('mongoose')

const UserAdministratorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
  }
)

module.exports = mongoose.model('UserAdministrator', UserAdministratorSchema)
