const mongoose = require('mongoose')
const asyncExpress = require('async-express')
const auth = require('../middleware/auth')
const Quiz = mongoose.model('Quiz')
const QuizAnswer = mongoose.model('QuizAnswer')
const QuizQuestion = mongoose.model('QuizQuestion')
const UserQuizAnswer = mongoose.model('UserQuizAnswer')
const _ = require('lodash')
const moment = require('moment')

/**
  * Helpful quiz id's
  * GAD7: 5d096d20e527d44b5ee2249a
  * PHQ9: 5d0a582c8d61686804e75f0b
  * Composite: 5d0a59bfcb586598b8f837f8
  **/
const GAD7_QUIZ_ID = mongoose.Types.ObjectId('5d096d20e527d44b5ee2249a')
const PHQ9_QUIZ_ID = mongoose.Types.ObjectId('5d0a582c8d61686804e75f0b')
const COMPOSITE_QUIZ_ID = mongoose.Types.ObjectId('5d0a59bfcb586598b8f837f8')

module.exports = (app) => {
  app.post('/quizzes', auth, createQuiz)
  app.get('/quizzes', auth, loadQuizzes)
  app.get('/quizzes/daily', auth, loadDailyQuiz)
  app.post('/quizzes/answer', auth, submitAnswer)
  app.get('/questions/daily', auth, loadDailyQuestion)
  app.get('/questions/daily/completed', auth, dailyQuestionCompleted)
}

const submitAnswer = asyncExpress(async (req, res) => {
  await UserQuizAnswer.create({
    createdAt: new Date(),
    userId: req.user._id,
    ...req.body,
  })
  res.status(204).end()
})

const dailyQuestionCompleted = asyncExpress(async (req, res) => {
  const latestAnswer = await UserQuizAnswer.findOne({
    userId: req.user._id,
    quizId: COMPOSITE_QUIZ_ID,
  })
    .sort({ createdAt: 'desc' })
    .exec()
  const completed = !latestAnswer || moment().startOf('day').isBefore(latestAnswer.createdAt)
  res.json({ completed })
})

const loadDailyQuestion = asyncExpress(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: COMPOSITE_QUIZ_ID,
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
  const answers = await UserQuizAnswer.find({
    userId: req.user._id,
    quizId: COMPOSITE_QUIZ_ID,
  })
    .sort({ createdAt: 'desc' })
    .limit(quiz.questions.length)
    .exec()
  const questionIds = quiz.questions.map((question) => question._id.toString())
  const consumedQuestionIds = answers.map((answer) => answer.questionId.toString())
  const nextQuestionId = _.chain(questionIds)
    .pull(consumedQuestionIds)
    .sample()
    .value()
  const question = await QuizQuestion.findOne({
    _id: mongoose.Types.ObjectId(nextQuestionId),
  })
    .populate({
      path: 'answers',
      model: 'QuizAnswer',
    })
    .exec()
  res.json({
    quizId: COMPOSITE_QUIZ_ID,
    question,
  })
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
