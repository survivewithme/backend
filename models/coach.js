const mongoose = require('mongoose')

const CoachSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: false,
    },
    lastname: {
      type: String,
      required: false,
    }
  }
)

module.exports = mongoose.model('Coach', CoachSchema)
