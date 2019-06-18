const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const QuizAnswerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    pointValue: {
      type: Number,
      required: false,
    },
  }
)

const QuizQuestionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    answers: {
      type: [
        {
          type: ObjectId,
          ref: 'QuizQuestion'
        },
      ],
    },
  }
)

const QuizSchema = new mongoose.Schema(
  {
    questions: {
      type: [
        {
          type: ObjectId,
          ref: 'QuizQuestion'
        },
      ],
    },
  }
)

mongoose.model('QuizAnswer', QuizAnswerSchema)
mongoose.model('QuizQuestion', QuizQuestionSchema)

module.exports = mongoose.model('Quiz', QuizSchema)
