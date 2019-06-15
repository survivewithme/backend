const mongoose = require('mongoose')

const UserAdministratorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  }
)

module.exports = mongoose.model('UserAdministrator', UserAdministratorSchema)
