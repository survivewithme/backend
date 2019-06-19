const mongoose = require('mongoose')

const UserQuizAnswerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  }
)

module.exports = mongoose.model('UserQuizAnswer', UserQuizAnswerSchema)
