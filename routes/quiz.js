const mongoose = require('mongoose')
const asyncExpress = require('async-express')
const auth = require('../middleware/auth')
const Quiz = mongoose.model('Quiz')
const QuizAnswer = mongoose.model('QuizAnswer')
const QuizQuestion = mongoose.model('QuizQuestion')
const UserQuizAnswer = mongoose.model('UserQuizAnswer')
const _ = require('lodash')

module.exports = (app) => {
  app.post('/quizzes', auth, createQuiz)
  app.get('/quizzes', auth, loadQuizzes)
  app.get('/quizzes/daily', auth, loadDailyQuiz)
  app.post('/quizzes/answer', auth, submitAnswer)
}

const submitAnswer = asyncExpress(async (req, res) => {
  await UserQuizAnswer.create({
    createdAt: new Date(),
    userId: req.user._id,
    ...req.body,
  })
  res.status(204).end()
})

const loadDailyQuiz = asyncExpress(async (req, res) => {
  const quizzes = await Quiz.find({
    _id: mongoose.Types.ObjectId('5d096d20e527d44b5ee2249a'),
  })
    .populate('questions')
    .populate({
      path: 'questions',
      populate: {
        path: 'answers',
        model: 'QuizAnswer',
      },
    })
    .exec()
  res.json(_.sample(quizzes))
})

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
    ...req.body,
    questions: questionDocs.map((question) => question._id),
  })
  res.json(quiz)
})
