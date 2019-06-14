const mongoose = require('mongoose')

const OrganizationCoachSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  }
)

module.exports = mongoose.model('OrganizationCoach', OrganizationCoachSchema)
