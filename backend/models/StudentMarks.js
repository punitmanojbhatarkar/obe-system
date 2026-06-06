const mongoose = require('mongoose');

const studentMarksSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  activityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  activityType: { type: String, enum: ['IA', 'MSE', 'ESE', 'Assignment', 'Activity', 'CA'] },
  // Simple CO-wise marks
  coMarks: [{
    coNo: String,
    marksObtained: { type: Number, default: 0 },
    maxMarks: Number,
    percentage: Number
  }],
  // Question-wise marks (for MSE/ESE)
  questionMarks: [{
    qNo: String,
    marksObtained: { type: Number, default: 0 },
    maxMarks: Number,
    coMapped: String
  }],
  totalMarks: Number,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentMarks', studentMarksSchema);
