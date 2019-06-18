const mongoose = require('mongoose')
const asyncExpress = require('async-express')
const Quiz = mongoose.model('Quiz')
const QuizAnswer = mongoose.model('QuizAnswer')
const QuizQuestion = mongoose.model('QuizQuestion')

module.exports = (app) => {
  app.post('/quizzes', createQuiz)
  app.get('/quizzes', loadQuizzes)
}

const loadQuizzes = asyncExpress(async (req, res) => {
  const quizzes = await Quiz.find({})
    .populate('questions')
    .populate({
      path: 'questions',
      populate: {
        path: 'answers',
        model: 'QuizAnswer',
      },
    })
    .exec()
  res.json(quizzes)
})

/**
  {
    questions: [ answers: [ ] ]
  }
**/
const createQuiz = asyncExpress(async (req, res) => {
  // Need to create models in 3 collections
  const { questions } = req.body
  const promises = questions.map(async (question) => {
    const answers = await QuizAnswer.insertMany(question.answers)
    return await QuizQuestion.create({
      ...question,
      answers: answers.map((answer) => answer._id),
    })
  })
  const questionDocs = await Promise.all(promises)
  const quiz = await Quiz.create({
    questions: questionDocs.map((question) => question._id),
  })
  res.json(quiz)
})
