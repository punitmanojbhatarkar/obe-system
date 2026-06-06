const mongoose = require('mongoose');

const attainmentSchema = new mongoose.Schema({
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicContext', required: true },
  // Configurable per academic year (set by Admin)
  thresholds: {
    level1: { type: Number, default: 65 },
    level2: { type: Number, default: 75 },
    level3: { type: Number, default: 85 }
  },
  directWeight: { type: Number, default: 0.8 },
  indirectWeight: { type: Number, default: 0.2 },
  coAttainment: [{
    coNo: String,
    // Direct
    iaPercent: Number,
    msePercent: Number,
    ciePercent: Number,
    cieLevel: Number,
    esePercent: Number,
    eseLevel: Number,
    directAvgPercent: Number,
    directLevel: Number,
    // Indirect
    surveyPercent: Number,
    indirectLevel: Number,
    // Final
    finalLevel: Number
  }],
  poAttainment: [{
    poNo: String,
    target: Number,
    achieved: Number,
    percentAchievement: Number
  }],
  // Per batch breakdown
  batchWise: [{
    batch: String,
    coAttainment: [{
      coNo: String,
      directLevel: Number,
      finalLevel: Number
    }]
  }],
  calculatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attainment', attainmentSchema);
