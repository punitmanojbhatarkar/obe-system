const mongoose = require('mongoose');

const exitSurveySchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  surveyLink: { type: String, unique: true }, // shareable token
  isOpen: { type: Boolean, default: true },
  questions: [{
    qNo: Number,
    statement: String,
    coMapped: String // 'CO1'
  }],
  responses: [{
    studentPRN: String,
    submittedAt: { type: Date, default: Date.now },
    answers: [{
      qNo: Number,
      coMapped: String,
      score: { type: Number, min: 1, max: 5 }
    }]
  }],
  // Computed
  coAverages: [{
    coNo: String,
    avgScore: Number,
    avgPercent: Number,
    attainmentLevel: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExitSurvey', exitSurveySchema);
