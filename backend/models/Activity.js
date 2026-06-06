const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  activities: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['IA', 'MSE', 'ESE', 'Assignment', 'Activity', 'CA'], required: true },
    maxMarks: { type: Number, required: true },
    cosMapped: [{ type: String }], // ['CO1', 'CO2']
    rbtLevel: { type: String },
    posMapped: [{ type: String }],
    tentativeDate: { type: String },
    division: { type: String, default: 'ALL' }, // ALL or specific division
    // For question-wise mapping (MSE/ESE)
    questions: [{
      qNo: String,
      maxMarks: Number,
      coMapped: String // 'CO1'
    }]
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
