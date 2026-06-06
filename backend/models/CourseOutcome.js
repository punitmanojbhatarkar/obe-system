const mongoose = require('mongoose');

const courseOutcomeSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  cos: [{
    coNo: { type: String, required: true }, // 'CO1' to 'CO6'
    statement: { type: String },
    bloomsLevel: { type: String, enum: ['Level 1','Level 2','Level 3','Level 4','Level 5','Level 6', ''] },
    targetPercent: { type: Number, default: 55 },
    assessedIn: {
      IA: { type: Boolean, default: true },
      MSE: { type: Boolean, default: true },
      ESE: { type: Boolean, default: true }
    },
    isActive: { type: Boolean, default: false } // false if CO statement is empty
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseOutcome', courseOutcomeSchema);
