const mongoose = require('mongoose')

const UserCoachSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }
  }
)

module.exports = mongoose.model('UserCoach', UserCoachSchema)
