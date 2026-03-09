const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
  },
  total: {
    type: Number,
    required: true,
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    userAnswer: String,
  }],
  improvementSuggestions: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quiz', quizSchema);